const isEmail = (email) => {
    const regEx = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (email.match(regEx)) return true;
    else return false;
}
const isEmpty = (string) => {
    if (string.trim() === '') return true;
    else return false;
}


exports.validateSignupData = (data) => {
    let errors = {};
    if (isEmpty(data.email)) {
        errors.email = 'Eamil Must not be empty';
    } else if (!isEmail(data.email)) {
        errors.email = 'Must be a valid email address';
    }

    if (isEmpty(data.password))
        errors.password = "Must not be empty";
    if (data.password !== data.confirmPassword)
        errors.confirmPassword = "Passwords must match"
    if (data.handle.trim() === '')
        errors.handle = "Must not be empty";

    // if (Object.keys(errors).length > 0) return res.status(400).json(errors);
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }

}

exports.validateLoginData = (data) => {
    let errors = {};
    if (isEmpty(data.email))
        errors.email = 'Email Must not be empty';
    if (isEmpty(data.password))
        errors.password = "Password dataMust not be empty";

    // if (Object.keys(errors).length > 0)
    //     return res.status(400).json(errors);
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.reduceUserDetails = (data) => {
    let userDetails = {};
    if (!isEmpty(data.bio.trim()))
        userDetails.bio = data.bio;
    if (!isEmpty(data.website.trim())) {
        // http://wesite.com
        if (data.website.trim().substring(0, 4) !== 'http') {
            userDetails.website = `http://${data.website.trim()}`;
        } else {
            userDetails.website = data.website;
        }
    }

    if (!isEmpty(data.location.trim()))
        userDetails.location = data.location;

    return userDetails;
}