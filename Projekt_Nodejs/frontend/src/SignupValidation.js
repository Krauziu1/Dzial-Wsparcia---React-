function validation (values) {
    let error={}
    const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const password_pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[A-Za-z\d!@#$%^&*()]{8,}$/;

    if(values.name ==="") {
        error.name ="Imie nie może być puste"
    }else {
        error.name = ""
    }
    
    
    
    if(values.email ==="") {
        error.email ="Email nie może być puste"
    }

    else if(!email_pattern.test(values.email)){
        error.email = "Niepoprawny email"

    }else {
        error.email =""
    }

    if(values.password ==="") {
        error.password = "Hasło nie może być puste"
    }
    else if (!password_pattern.test(values.password)) {
        error.password = "Niepoprawne hasło"

    }else{
        error.password = ""
    }
    return error;
}

export {validation};