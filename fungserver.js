var MongoClient = require('mongodb').MongoClient;
var dbUrl = "mongodb://localhost:27017/";

(function() 
 {
	var fs, http, qs, server, url;
	http = require('http');
	url = require('url');
	qs = require('querystring');
	fs = require('fs');
	
	var loginStatus = false, loginUser = "";
	
	server = http.createServer(function(req, res) 
	{
		var action, form, formData, msg, publicPath, urlData, stringMsg;
		urlData = url.parse(req.url, true);
		action = urlData.pathname;
		publicPath = __dirname + "\\public\\";
		console.log(req.url);
		
		if (action === "/actSignup") 
		{
			console.log("signup");
			if (req.method === "POST") 
			{
				console.log("action = post");
				formData = '';
				msg = '';
				return req.on('data', function(data) 
				{
					formData += data;
          
					console.log("form data="+ formData);
					return req.on('end', function() 
					{
						var user;
						user = qs.parse(formData);
						user.id = "0";
						msg = JSON.stringify(user);
						stringMsg = JSON.parse(msg);
						var splitMsg = formData.split("&");
						var tempSplitName = splitMsg[1];
						var splitName = tempSplitName.split("=");
						var searchDB = "Name : " + splitName[1];
						console.log("mess="+msg);
						console.log("mess="+formData);
						console.log("search=" + searchDB);
						res.writeHead(200, 
						{
							"Content-Type": "application/json",
							"Content-Length": msg.length
						});
						MongoClient.connect(dbUrl, function(err, db) 
						{
							var finalcount;
							if (err) throw err;
							var dbo = db.db("leo_db");
							var myobj = stringMsg;
							dbo.collection("user").count({"Name" : splitName[1]}, function(err, count)
							{
								console.log(err, count);
								finalcount = count;
								if(finalcount > 0)
								{
									if(err) throw err;
									console.log("user exist");
									db.close();
									return res.end("fail");
								}
								else
								{
									dbo.collection("user").insertOne(myobj, function(err, res) 
									{
										if (err) throw err;
										console.log("1 document inserted");
										db.close();
									});
									return res.end(msg);
								}
							});
						});
					});
				});
				
			} 
			else 
			{
				form = "signup.html";
				return fs.readFile(form, function(err, contents) 
				{
					if (err !== true) 
					{
						res.writeHead(200, 
						{
							"Content-Type": "text/html"
						});
						return res.end(contents);
					} 
					else 
					{
						res.writeHead(500);
						return res.end;
					}
				});
			}
		} 
		else if( action ==="/addNewpage")
		{
			res.writeHead(200, 
			{
				"Content-Type": "text/html"
			});
			return res.end("<h1>welcome </h1><p><a href=\"/Signup\">register</a></p>");
		}
    else if (action === "/actLogin")
		{
			console.log("login");
			if (req.method === "POST") 
			{
				console.log("action = post");
				formData = '';
				msg = '';
				return req.on('data', function(data) 
				{
					formData += data;
					console.log("form data="+ formData);
					return req.on('end', function() 
					{
						var user;
						user = qs.parse(formData);
						msg = JSON.stringify(user);
						stringMsg = JSON.parse(msg);
						var splitMsg = formData.split("&");
						var tempSplitName = splitMsg[0];
						var splitName = tempSplitName.split("=");
						var tempPassword = splitMsg[1];
						var splitPassword = tempPassword.split("=");
						console.log("mess="+msg);
						console.log("mess="+formData);
						console.log("user=" + splitName[1] + ", password=" + splitPassword[1]);
						res.writeHead(200, 
						{
							"Content-Type": "application/json",
							"Content-Length": msg.length
						});
						MongoClient.connect(dbUrl, function(err, db) 
						{
							var finalcount;
							if (err) throw err;
							var dbo = db.db("leo_db");
							var myobj = stringMsg;
							dbo.collection("user").count({"Name" : splitName[1], "Password" : splitPassword[1]}, function(err, count)
							{
								console.log(err, count);
								finalcount = count;
								if(err) throw err;
								if(finalcount > 0)
								{
									loginStatus = true;
									loginUser = splitName[1];
									console.log("user exist, user is: " + loginUser);
									db.close();
									return res.end(msg);
								}
								else
								{
									db.close();
									console.log("user or pw not match");
									return res.end("fail");
								}
							});
						});
					});
				});
			}
			else 
			{
				form = "login.html";
				return fs.readFile(form, function(err, contents) 
				{
					if (err !== true) 
					{
						res.writeHead(200, 
						{
							"Content-Type": "text/html"
						});
						return res.end(contents);
					} 
					else 
					{
						res.writeHead(500);
						return res.end;
					}
				});
			}
		}
		else if (action === "/actSearch")
		{
			console.log("search");
			if (req.method === "POST") 
			{
				console.log("action = post");
				formData = '';
				msg = '';
				return req.on('data', function(data) 
				{
					formData += data;
          
					console.log("form data="+ formData);
					return req.on('end', function() 
					{
						var user;
						user = qs.parse(formData);
						msg = JSON.stringify(user);
						stringMsg = JSON.parse(msg);
						var splitMsg = formData.split("=");
						console.log("mess="+msg);
						console.log("mess="+formData);
						MongoClient.connect(dbUrl, function(err, db) 
						{
							var finalcount;
							if (err) throw err;
							var dbo = db.db("leo_db");
							var myobj = stringMsg;
							dbo.collection("passagelist").find({"key" : splitMsg[1]}).toArray(function(err, result) 
							{
    						if (err) throw err;
    						console.log(result);
    						db.close();
								var parseResult = result;
								var resultReturn = JSON.stringify(parseResult);
								console.log(resultReturn);
								return res.end(resultReturn);
							});
						});
					});
				});
			}
			else 
			{
				form = "search.html";
				return fs.readFile(form, function(err, contents) 
				{
					if (err !== true) 
					{
						res.writeHead(200, 
						{
							"Content-Type": "text/html"
						});
						return res.end(contents);
					} 
					else 
					{
						res.writeHead(500);
						return res.end;
					}
				});
			}
		}
		else if (action === "/actFav")
		{
			if(!loginStatus)
			{
				console.log("no logged in user found");
			}
			else
			{
				console.log("read favour");
				MongoClient.connect(dbUrl, function(err, db) 
				{
					var finalcount;
					if (err) throw err;
					var dbo = db.db("leo_db");
					var myobj = stringMsg;
					dbo.collection("favourite").find({"user" : loginUser}).toArray(function(err, result) 
					{
    				if (err) throw err;
    				console.log(result);
    				db.close();
						//var parseResult = result;
						var resultReturn = JSON.stringify(result);
						console.log(resultReturn);
						return res.end(resultReturn);
					});
				});
				}
		}
		else if (action === "/addList")
		{
			if(loginStatus)
			{
				console.log("add to favourite");
				if (req.method === "POST") 
				{
					console.log("action = post");
					formData = '';
					msg = '';
					return req.on('data', function(data) 
					{
						formData += data;
          
						console.log("form data="+ formData);
						return req.on('end', function() 
						{
							var user;
							user = qs.parse(formData);
							msg = JSON.stringify(user);
							stringMsg = JSON.parse(msg);
							var splitMsg = formData.split("=");
							console.log("mess="+msg);
							console.log("mess="+formData);
							res.writeHead(200, 
							{
								"Content-Type": "application/json",
								"Content-Length": msg.length
							});
							MongoClient.connect(dbUrl, function(err, db) 
							{
								var finalcount;
								if (err) throw err;
								var dbo = db.db("leo_db");
								var myobj = {"user" : loginUser, "key" : splitMsg[1]};
								dbo.collection("favourite").count(myobj, function(err, count)
								{
									console.log(err, count);
									finalcount = count;
									if(finalcount > 0)
									{
										if(err) throw err;
										console.log("fav exist");
										db.close();
										return res.end("fail");
									}
									else
									{
										dbo.collection("favourite").insertOne(myobj, function(err, res) 
										{
											if (err) throw err;
											console.log("fav inserted");
											db.close();
										});
										return res.end(msg);
									}
								});
							});
						});
					});
				}
			}
			else
			{
				console.log("no user detected.");
			}
		}
		else if (action === "/removeList")
		{
			if(loginStatus)
			{
				console.log("remove from list");
				if (req.method === "POST") 
				{
					console.log("action = post");
					formData = '';
					msg = '';
					return req.on('data', function(data) 
					{
						formData += data;
          
						console.log("form data="+ formData);
						return req.on('end', function() 
						{
							var user;
							user = qs.parse(formData);
							msg = JSON.stringify(user);
							stringMsg = JSON.parse(msg);
							var splitMsg = formData.split("=");
							console.log("mess="+msg);
							console.log("mess="+formData);
							res.writeHead(200, 
							{
								"Content-Type": "application/json",
								"Content-Length": msg.length
							});
							MongoClient.connect(dbUrl, function(err, db) 
							{
								var finalcount;
								if (err) throw err;
								var dbo = db.db("leo_db"); 
								var myobj = {"user" : loginUser, "key" : splitMsg[1]};
								dbo.collection("favourite").count(myobj, function(err, count)
								{
									console.log(err, count);
									finalcount = count;
									if(finalcount > 0)
									{
										dbo.collection("favourite").deleteOne(myobj, function(err, res) 
										{
											if (err) throw err;
											console.log("fav removed");
											db.close();
										});
										return res.end(msg);
									}
									else
									{
										if(err) throw err;
										console.log("fav not exist");
										db.close();
										return res.end("fail");
									}
								});
							});
						});
					});
				}
			}
			else
			{
				console.log("no user detected.");
			}
		}
		else 
		{
      //for the html file(xxx.html) here, rename them to other name. Don't forget to rename the file itself also
			if(req.url === "/index")
			{
				sendFileContent(res, "index.html", "text/html");
			}
			else if (req.url === "/regpage")
			{
				sendFileContent(res, "registerpage.html", "text/html");
			}
      
			else if (req.url === "/book1")
			{
				sendFileContent(res, "book01.html", "text/html");
			}
      else if (req.url === "/book2")
			{
				sendFileContent(res, "book02.html", "text/html");
			}
      else if (req.url === "/book3")
			{
				sendFileContent(res, "book03.html", "text/html");
      }
			else if (req.url === "/loginpage")
			{
				sendFileContent(res, "loginform.html", "text/html");
			}
			else if (req.url === "/login")
			{
				if(loginStatus)
				{
					sendFileContent(res, "login.html", "text/html");
				}
				else
				{
					sendFileContent(res, "index.html", "text/html");
				}
			}
			else if (req.url === "/logout")
			{
				loginStatus = false;
				loginUser = "";
				sendFileContent(res, "index.html", "text/html");
			}
      else if (req.url === "/text2")
			{
				sendFileContent(res, "templatetext_2.html", "text/html");
			}
      else if (req.url === "/book1")
			{
				sendFileContent(res, "book01.html", "text/html");
			}
      else if (req.url === "/book2")
			{
				sendFileContent(res, "book02.html", "text/html");
			}
      else if (req.url === "/book3")
			{
				sendFileContent(res, "book03.html", "text/html");
			}
     
      else if (req.url === "/googlemap")
			{
				sendFileContent(res, "googlemap.html", "text/html");
			}
       else if (req.url === "/favlist")
			{
        if(loginStatus) {
          sendFileContent(res, "favourite.html", "text/html");
        }else{
          sendFileContent(res, "index.html", "text/html");
        }
				
			}
			else if(req.url === "/")
			{
				console.log("Requested URL is url" + req.url);
				res.writeHead(200, 
				{
					'Content-Type': 'text/html'
				});
				res.write('<b>Hey there!</b><br /><br />This is the default response. Requested URL is: ' + req.url);
			}
			else if(/^\/[a-zA-Z0-9\/]*.js$/.test(req.url.toString()))
			{
				sendFileContent(res, req.url.toString().substring(1), "text/javascript");
			}
			else if(/^\/[a-zA-Z0-9\/]*.css$/.test(req.url.toString()))
			{
				sendFileContent(res, req.url.toString().substring(1), "text/css");
			}
			else if(/^\/[a-zA-Z0-9\/]*.jpg$/.test(req.url.toString()))
			{
				sendFileContent(res, req.url.toString().substring(1), "image/jpg");
			}
			else
			{
				console.log("Requested URL is: " + req.url);
				res.end();
			}
		}
	});

	server.listen(1500);

	console.log("Server is running，time is" + new Date());


	function sendFileContent(response, fileName, contentType)
	{
		fs.readFile(fileName, function(err, data)
		{
			if(err)
			{
				response.writeHead(404);
				response.write("Not Found!");
			}
			else
			{
				response.writeHead(200, {'Content-Type': contentType});
				response.write(data);
			}
			response.end();
		});
	}
 }).call(this);


