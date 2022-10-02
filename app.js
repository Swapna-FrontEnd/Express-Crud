const express = require('express')
const app = express();
const fs = require('fs')

//the following line is required to parse the request body
app.use(express.json())

//configure the server with port number 3000
app.listen(3000,() =>{
    console.log("Server started on Port No 3000");
})

//get route
app.get('/welcome',(req,res) =>{
    const output = {quote : 'Love the life you live....'}
    res.send(output)
})

/*
 Get Method to Read Users from json file
*/
app.get('/user/list',(req,res) => {
    const users = getUserData();
    res.send(users);
});

/* getUserData() is a user-defined util functions to
   get user data from json file */

const getUserData = () =>{
    const jsonData = fs.readFileSync('users.json');
    return JSON.parse(jsonData)
};

app.post('/adduser',(req,res) =>{
    //get the existing user data
    const existingUsers = getUserData();
    //get the new user details from the request body 
    const newUser = req.body;
    //check if the userdata fields are missing/null
    if(newUser.name == null || newUser.age == null 
        || newUser.username == null || newUser.password == null){
            return res.status(401).send({error:true,msg:'User data is missing/null'})
    }
    //check if username already exist
    const findExistingUser = 
            existingUsers.find( user => user.username === newUser.username);
    if(findExistingUser){
        return res.status(409).send({error:true,msg:'Username is already used'})
    }
    //append the new user data to the existing user data
    existingUsers.push(newUser);
    //save the new user data
    saveUserData(existingUsers);
    //send response if user added successfully
    res.send({success:true,msg:'User Data Added Successfully'})
});

//save the user data in to json file
const saveUserData = (data) =>{
    const stringifyData = JSON.stringify(data);
    //save user data to the file
    fs.writeFileSync('users.json',stringifyData);
}


/* Delete - Delete method */
app.delete('/user/delete/:username' ,(req,res) =>{

    /* reading param from the path */
    const uname = req.params.username;

    //get the existing userdata
    const userData = getUserData();

    //filter the userdata and remove it using filter method
    const afterFilterUserData = userData.filter( user => user.username != uname)

    if(userData.length === afterFilterUserData.length){
        return res.status(409).send({error:true,msg:"username does not exist"})
    }

    //save the filetered Data in to JSON file
    saveUserData(afterFilterUserData);

    res.send({success:true,msg:"user removed successfully"})

});

/* Modifying the user data */

app.patch('/user/update/:username',(req,res) =>{

        /* reading param from the path */
        const uname = req.params.username;

        //get the existing userdata
        const exitingUsersData = getUserData();

        //get the data to update from request body
        const updateUserData = req.body;

        //check if user exists or not
        const existingUser = exitingUsersData.filter( user => user.username === uname)
        if(!existingUser){
            return res.status(409).send({error:true,msg:"username does not exist"});
        }

        //filter the userdata
        const updatedUsersAfterFilter = exitingUsersData.filter( user => user.username !== uname)

        updatedUsersAfterFilter.push(updateUserData);

       // finally save it in users.json
       saveUserData(updatedUsersAfterFilter);

       res.send({success:true,msg:"user updated successfully"});
})