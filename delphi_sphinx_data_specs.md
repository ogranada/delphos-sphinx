
# Resources
```js
{
    "User": {
        "id": "number",
        "username": "string",
        "firstname": "string",
        "lastname": "string",
    },
    "Code": {
        "id": "number",
        "html": "string",
        "css": "string",
        "js": "string",
    },
    "Room": {
        "name": "string",
        "password": "string",
        "users": "User[]",
    },    
    "Question": {
        "code": "Code"
        "question": "string"
    }
}
```

# Interaction FE-BE

- NOTE: all web socket requests should contain request type

* crear Room (REST)
    - Request
        * room name
        * room password
        * admin password
    - Response
        * room name
        * room id
        * status

* Get Rooms (REST)
    - Request
    - Response
        * status

* Delete room (REST)
    - Request
        * room id
        * room password
        * admin password
    - Response
        * status

* Room Subscription (Web Socket)
    - Request
        * room id
        * room password

    - Response
        * code
        * status

* Dummy (Protocol)
    - Request
    - Response
        * status


