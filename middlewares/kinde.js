exports.validateToken = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return res.status(401).send({ error: "No authorization header provided." });
  }

  const token = authorizationHeader.split(" ")[1]; // Assuming "Bearer TOKEN"
  try {
    const response = await axios.post(
      process.env.KINDE_TOKEN_VALIDATION_ENDPOINT,
      {
        token: token,
        client_id: process.env.KINDE_CLIENT_ID,
        client_secret: process.env.KINDE_CLIENT_SECRET,
      }
    );

    // Check the validation response
    // Depending on Kinde's response, adjust the condition accordingly
    if (response.data.active) {
      req.user = response.data; // or a subset of the validated token data
      next();
    } else {
      return res.status(401).send({ error: "Invalid or expired token." });
    }
  } catch (error) {
    return res.status(500).send({ error: "Error validating token." });
  }
};
