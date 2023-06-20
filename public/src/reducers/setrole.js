
// this is a reducer which takes two things current state and action 
// this is pure JS function 
const initialState= "";
const setrole = (state = initialState,action)=>{
    switch(action.type){
        case "admin": return "admin";
        case "user": return "user";
        default: return state;
    }
    

}

export default setrole;