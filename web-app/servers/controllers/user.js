const authModel = require('../models/user.js');
const apiResponse = require('../utils/apiResponse.js');

exports.signup = async (req, res) => {
    const {userType, address, name, email, password } = req.body;
    console.log({userType, address, name, email, password });
    const { role } = req.params;

    console.log(req.body);
    console.log(role);
    console.log('==============');

    if ((!userType || !address || !name  || !email || !password )) {
        console.log('Errir here');
        return apiResponse.badRequest(res);
    }

    let modelRes;

    if (role === 'manufacturer') {
        modelRes = await authModel.signup(true, false, false, {userType, address, name, email, password });
    } else if (role === 'middlemen') {
        modelRes = await authModel.signup(false, true, false, {userType, address, name, email, password });
    } else if (role === 'consumer') {
        modelRes = await authModel.signup(false, false, true, {userType, address, name, email, password });
    } else {
        return apiResponse.badRequest(res);
    }

    return apiResponse.send(res, modelRes);
};

exports.signin = async (req, res) => {
    const { id, password } = req.body;
    const { role } = req.params;
    if (!id || !password || !role) {
        return apiResponse.badRequest(res);
    }

    let modelRes;
    if (role === 'manufacturer') {
        modelRes = await authModel.signin(true, false, false, { id, password });
    } else if (role === 'middlemen') {
        modelRes = await authModel.signin(false, true, false, { id, password });
    } else if (role === 'consumer') {
        modelRes = await authModel.signin(false, false, true, { id, password });
    } else {
        return apiResponse.badRequest(res);
    }

    return apiResponse.send(res, modelRes);
};


exports.getAllUser = async (req, res) => {
    const { id } = req.body;
    const { role } = req.params;

    let modelRes;
    if (role === 'manufacturer') {
        modelRes = await authModel.getAllUser(true, false, false, {id});
    } else if (role === 'middlemen') {
        modelRes = await authModel.getAllUser(false, true, false, {id});
    } else if (role === 'consumer') {
        modelRes = await authModel.getAllUser(false, false, true, {id});
    } else {
        return apiResponse.badRequest(res);
    }
    return apiResponse.send(res, modelRes);
};