## react-forum-platform-server
A forum platform backend restful http service based on Express.js, node.js and mongoDB.


### API:
### User:
#### CreateUser (POST):

--request POST /api/user 

--header Content-type: application/json

--data
{
  "email": "xxx@gmail.com",
  "username": "xxx",
  "password": "xxx"
}

#### LoginUser (POST):

--request POST /api/forum/:forumId/bulletin

--header Content-type: application/json

--data
{
  "username": "xxx",
  "password": "xxx"
}

#### GetUserProfile (GET):

--request GET /api/user/tomcat

--authorization Bearer Token

#### EXtendLogin (PUT):

--request PUT /api/session/local

--authorization Bearer Token

### Forum:
#### GetForum (GET):

--request GET /api/forum?sorting_method=c&filtering_method=

#### CreateForum (POST):

--request POST /api/forum

--authorization Bearer Token

--header Content-type: application/json

--data
{
	"name": "xxx",
	"description": "xxx",
	"category": "xxx"
}

#### DeleteForum (DELETE):

--request DELETE /api/forum/:forumId

--authorization Bearer Token

#### GetBulletin (GET):

--request GET /api/forum/:forumId/bulletin

### Topic:
#### GetOneTopic (GET):

--request GET /api/forum/:forumId/topic/:topicId

#### GetTopics (GET):

--request GET /api/forum/:forumId/topic

#### CreateTopic (POST):

--request POST /api/forum/forumId/topic

--authorization Bearer Token

--header Content-type: application/json

--data
{
    "topicName": "xxx",
    "category": "xxx",
    "tags": [
        "xxx1",
        "xxx2"
    ],
    "content": {
        "children": [
            {
                "text": "xxx"
            }
        ]
    }
}

#### DeltetTopic (DELETE):

--request DELETE /api/forum/:forumId/topic/:topicId

--authorization Bearer Token

### Reply:
#### GetRepies (GET):

--request GET /api/forum/forumId/topic/:topicId/reply

#### CreateTopic (POST):

--request POST /api/forum/forumId/topic/:topicId

--authorization Bearer Token

--header Content-type: application/json

--data
{
	"content":{
            "children": [
                {
                    "text": "xxx"
                }
            ]
        }
}

#### DeltetTopic (DELETE):

--request DELETE /api/forum/forumId/topic/:topicId/reply/:replyId

--authorization Bearer Token

### Tag:
#### GetTags (GET):

--request GET /api/tag

### Category:
#### GetCategory (GET):

--request GET /apii/category?type=
