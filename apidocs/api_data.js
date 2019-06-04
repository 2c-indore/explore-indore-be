define({ "api": [
  {
    "type": "get",
    "url": "/api/amenities/download",
    "title": "Download amenities data",
    "name": "Download_amenities_data",
    "group": "Amenities",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "success",
            "description": "<p>Success status</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "message",
            "description": "<p>Success message</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Query Parameters Format",
          "content": " {\n     \"type\" : \"public_hospitals, bus_stops, blood_banks, etc..\",\n\t\t\"outputFormat\" : \"json OR csv\"\n }",
          "type": "json"
        }
      ]
    },
    "description": "<p>API to get download data for amenities in csv or json format.</p>",
    "version": "1.0.0",
    "filename": "src/api/index.js",
    "groupTitle": "Amenities"
  },
  {
    "type": "put",
    "url": "/api/amenities/update/:id",
    "title": "Edit amenities [*Protected]",
    "name": "Edit_amenities",
    "group": "Amenities",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "success",
            "description": "<p>Success status</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "message",
            "description": "<p>Success message</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Route Parameters Format",
          "content": "{\n    \"id\": \"2csdekoploer\"\n}",
          "type": "json"
        },
        {
          "title": "Body Parameters Format",
          "content": "{\n    \"data\" : JSON object\n}",
          "type": "json"
        }
      ]
    },
    "description": "<p>API to update data element.</p>",
    "version": "1.0.0",
    "filename": "src/api/index.js",
    "groupTitle": "Amenities"
  },
  {
    "type": "get",
    "url": "/api/amenities/data",
    "title": "Get amenities data",
    "name": "Get_amenities_data",
    "group": "Amenities",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "success",
            "description": "<p>Success status</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "message",
            "description": "<p>Success message</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Query Parameters Format",
          "content": "{\n    \"type\" : \"public_hospitals, bus_stops, blood_banks, etc..\",\n}",
          "type": "json"
        }
      ]
    },
    "description": "<p>API to get data for amenities</p>",
    "version": "1.0.0",
    "filename": "src/api/index.js",
    "groupTitle": "Amenities"
  },
  {
    "type": "post",
    "url": "/api/users/authenticate",
    "title": "Authenticate user",
    "name": "Authenticate_user",
    "group": "User",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "success",
            "description": "<p>Success status</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "message",
            "description": "<p>Success message</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Body Parameters Format",
          "content": " {\n     \"email\" : \"email@email.com\",\n\t\t\"password\" : \"password\"\n }",
          "type": "json"
        },
        {
          "title": "Success-Response:",
          "content": "\n {\n\t\t\"success\": 1,\n\t\t\"message\": \"Login successful\",\n\t\t\"token\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZG4iOiIxNTU5NDUwMDUyMjEzXzVjZjM1MTVjY2JmMTY0MThkMDlhODI4N181NjMuODkwNzA5ODcxNDA1MiIsImlhdCI6MTU1OTQ1MDA1MiwiZXhwIjoxNTkxMDA3NjUyfQ.JT-AGeI764SK7Tr-nDCSNzfoSjJY-6OffaFodzr1OYc\"\n\t}",
          "type": "json"
        }
      ]
    },
    "description": "<p>API to authenticate user</p>",
    "version": "1.0.0",
    "filename": "src/api/index.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/api/users/signup",
    "title": "Signup user",
    "name": "Signup_user",
    "group": "User",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "success",
            "description": "<p>Success status</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "message",
            "description": "<p>Success message</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Body Parameters Format",
          "content": " {\n     \"email\" : \"email@email.com\",\n     \"username\" : \"username\",\n\t\t\"password\" : \"password\"\n }",
          "type": "json"
        },
        {
          "title": "Success-Response:",
          "content": "\n{\n     \"success\": 1,\n     \"message\" :\"Signupsuccessful\"\n }",
          "type": "json"
        }
      ]
    },
    "description": "<p>API to authenticate user</p>",
    "version": "1.0.0",
    "filename": "src/api/index.js",
    "groupTitle": "User"
  },
  {
    "type": "get",
    "url": "/api/users/profile",
    "title": "Profile [*Protected]",
    "name": "Profile",
    "group": "Users",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "success",
            "description": "<p>Success status</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "message",
            "description": "<p>Success message</p>"
          }
        ]
      }
    },
    "description": "<p>API to get user profile</p>",
    "version": "1.0.0",
    "filename": "src/api/index.js",
    "groupTitle": "Users"
  }
] });
