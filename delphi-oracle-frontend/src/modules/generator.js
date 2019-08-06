/* eslint-disable no-console */

const getReferences = () => {
    try {
        return {
            skills: require('../config/references/skills.json'),
            experience: require('../config/references/yearsOfExperience.json'),
            english: require('../config/references/english.json'),
            seniorities: require('../config/references/seniorities.json'),
            answer: require('../config/references/ans_template.json'),
            generator: require('../config/references/generator.json')
        }
    } catch (err) {
        console.log(err);
    }
};

const SRTY_MSG = (s, sug) =>
    `${generator['seniority-result']} ${s}. ${
    sug && !sug.includes(s) ? `${sug}` : ''
    }`;

const random = options => {
    const pos = parseInt(Math.random() * options.length - 1, 10);
    return options[pos];
};

const assembleSentence = (name, topic, level, dict) => {
    const about = random(generator['about-sentences']);
    const knows = generator['knowledge-levels'][level];
    const complement = generator['complement-levels'][level];
    const _topics = topic.split(',');
    const plurality = _topics.length === 1 ? generator['plurality'][0] : generator['plurality'][1];
    const t_topics = _topics.map(x => dict[x.trim()] || x).join(', ');
    return `${name} ${knows} ${about} ${t_topics}${complement}${plurality}`;
};

const analizeTopics = (candidate, topics, dict) => {
    topics.sort((a, b) => b.value - a.value);
    const resumeItems = topics
        .reduce((acc, el) => {
            if (!acc[el.value]) {
                acc[el.value] = [];
            }
            const txt = dict[el.option || el.topic] || (el.option || el.topic);
            acc[el.value].push(txt);
            return acc;
        }, [])
        .map(elms => elms.join(', '));
    const resumes = [];
    const skills = {
        strength: '',
        weakness: '',
    };

    for (let index = 0; index <= generator['possivle-values']; index++) {
        const topic = resumeItems[index];
        resumes[index] = topic
            ? assembleSentence(candidate, topic, index, dict)
            : '';
    }
    skills.weakness = [resumes[1], resumes[2]]
        .filter(x => x)
        .join(', ' + random(generator['also-sencences']) + ' ');
    skills.strength = [resumes[3], resumes[4], resumes[5]]
        .filter(x => x)
        .join(', ' + random(generator['also-sencences']) + ' ');
    return skills;
};

const getSkillsForCatTopic = (categoryValue, topicValue, value, skills) => {
    const topic = topicValue.toLowerCase();

    return skills
        .map(skill => {
            if (!skill.description) {
                skill.description = skill.name;
            }
            return skill;
        })
        .filter(skill => skill.description)
        .filter(skill => {
            if (skill.description.toLowerCase() === topic.toLowerCase()) {
                return true;
            }
        })
        .map(skill => ({
            id: skill.id,
            name: skill.name,
            weight: generator['skill-values'][value],
        }));
}

const generateJSON = (inputFile) => {
    const { answer, skills, experience, english, seniorities } = getReferences();
    const allData = inputFile;
    const data = allData.technical;
    const personalData = allData.personal;
    let user_skills = [];
    let _answer = { ...answer };
    const strengths = [];
    const weaknesses = [];
    const scores = [];
    Object.keys(data).forEach(category => {
        const children = data[category];
        console.log(`- Generating ${category} skills`);
        if (category !== 'generic') {
            const topics = analizeTopics(
                personalData.name,
                children.filter(item => item.value > 0),
                allData.translation || {},
            );
            weaknesses.push(topics.weakness);
            strengths.push(topics.strength);
        }
        const validChildren = children.filter(item => item.value > 0);
        validChildren.forEach(element => {
            const nuserskills = user_skills.concat(
                getSkillsForCatTopic(
                    category,
                    element.topic,
                    element.value,
                    skills.data,
                ),
            );
            if (category === 'generic') {
                console.log('Generic skills ->', nuserskills);
            }
            user_skills = nuserskills;
        });
        if (validChildren.length > 0) {
            const prom =
                validChildren.map(x => x.value).reduce((acc, val) => acc + val) /
                validChildren.length;
            global.console.log('    -', prom);
            if ('html,css,javascript'.split(',').includes(category)) {
                scores.push(prom);
            }
        }
    });
    const scoresAvg = scores.length > 0 && scores.reduce((acc, val) => acc + val) / scores.length;
    let assigned_seniority = null;
    generator['seniority-ranges'].forEach(srty => {
        if (srty.min <= scoresAvg && scoresAvg <= srty.max) {
            assigned_seniority = srty.value;
        }
    });

    _answer.weakSkillsComments = weaknesses
        .filter(x => x)
        .join('.\n')
        .replace(/\.\./g, '.');
    _answer.strengthSkillsComments = strengths
        .filter(x => x)
        .join('.\n')
        .replace(/\.\./g, '.');
    // experience
    const exp = experience.filter(
        x =>
            x.description.toLowerCase() ===
            personalData.yearsOfExperience.toLowerCase(),
    );
    // english
    const eng = english.filter(
        x => x.description.toLowerCase() === personalData.english.toLowerCase(),
    );
    // seniorities
    if (personalData.seniority) {
        assigned_seniority = personalData.seniority;
        console.log('Defined Seniority:', assigned_seniority);
    } else {
        console.log('Calculated Seniority:', assigned_seniority);
    }
    const seniority = seniorities.filter(
        x => x.name.toLowerCase() === assigned_seniority.toLowerCase(),
    )[0];
    _answer.yearsOfExperienceComments = personalData.experienceInfo;
    if (exp.length) {
        _answer.yearsOfExperience = exp[0].id;
    }
    if (eng.length) {
        _answer.technicalEnglishLevel = eng[0].id;
    }
    if (seniority) {
        _answer.evaluatedSeniority = seniority.id;
    }

    _answer.fitPosition = true;
    _answer.fitCompanyValue = true;
    _answer.evaluationResultComments = SRTY_MSG(
        generator['seniority-long'][seniority.name],
        personalData.evaluationResultComments,
    );
    _answer.overallComments = personalData.overallComments;
    _answer.technicalEnglishLevelComments = personalData.englishComments;
    _answer.interviewId = personalData.interviewId || -1;
    _answer.suggestedStudioId = 57202775;

    _answer.skills = user_skills.concat(
        personalData.skills.map(gskill => {
            const skill = skills.data.filter(
                sk => sk.name.toLowerCase() === gskill.topic.toLowerCase(),
            )[0];
            return {
                id: skill.id,
                name: skill.name,
                weight: generator['skill-values'][gskill.value],
            };
        }),
    );

    console.log(`* Skills file generated`);

    return {
        answer: _answer,
        personal: personalData,
        technical: data
    };
}

const generator = (inputFile) => {
    if (!inputFile) {
        console.log('Missing input file');
        return;
    }

    return generateJSON(inputFile);
}

export {
    generator
}
