const users = []

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room })=>{
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // validate the data
    if(!username || !room){
        return {
            error: "username and room is required!"
        };
    }

    // Check for existing users

    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username;
    })

    if(existingUser){
        return {
            error: 'Username is in use!'
        }
    }

    // Storing users

    const user =  {
        id,
        username,
        room
    }

    users.push(user);

    return { user };

}

const removeUser = (id) => {
    const index = users.findIndex((user)=>{
        return user.id === id
    })
    if(index!==-1){
        return users.splice(index, 1)[0];
    }
    return { 
        error: 'User does not exist!'
     };
}

const getUser = (id)=>{
    return users.find( user => user.id === id);
}

const getUsersInRoom = (room)=>{
    // room = room.trim().toLowerCase();
    const usersInRoom = users.filter((user)=>{
        return user.room === room;
    })
    return usersInRoom;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom 
}