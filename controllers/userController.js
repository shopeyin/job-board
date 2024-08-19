//Check createUser name or email missing middleware
exports.checkBody = (request, response, next) => {
  console.log("checkBody middleware before creating user");
  if (!request.body.name || !request.body.email) {
    return response
      .status(400)
      .json({ status: "failed", message: "Name or email missing" });
  }

  next();
};

exports.addRequestTime = (request, response, next) => {
  console.log(
    "add request time to response middleware before getting all users"
  );
  request.requestTime = new Date().toISOString();

  next();
};

// CHECKING PARAMS MIDDLEWARE
exports.checkID = (request, response, next, val) => {
  console.log("checking params value",val, request.params, );
  if (val === '5') {
    return response
      .status(400)
      .json({ status: "failed", message: "Invalid Id" });
  }

  next();
};

exports.getAllUsers = (request, response) => {
  try {
    response.status(200).json({
      status: "success",
      requestTime: request.requestTime,
      data: {
        users: [
          {
            name: "Ola",
            age: "3",
          },
          {
            name: "FOla",
            age: "31",
          },
        ],
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "There is an errot",
    });
  }
};
exports.getUser = (request, response) => {
  try {
    
    response.status(200).json({
      status: "success",
      data: {
        users: [
          {
            name: "Ola",
            age: "3",
          },
        ],
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: "There is an error",
    });
  }
};
exports.createUser = (request, response) => {
  try {
    response.status(201).json({
      status: "success",
      data: {
        users: [
          {
            name: "Ola",
            age: "3",
          },
        ],
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "There is an error",
    });
  }
};
exports.updateUser = (req, res) => {
  try {
    response.status(200).json({
      status: "success",
      data: {
        users: [
          {
            name: "Ola",
            age: "3",
          },
        ],
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: "There is an error",
    });
  }
};
exports.deleteUser = (req, res) => {
  try {
    response.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: "There is an error",
    });
  }
};
