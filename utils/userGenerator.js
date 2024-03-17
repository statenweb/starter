// Import required AWS SDK v3 packages
const {
  IAMClient,
  GetUserCommand,
  CreateUserCommand,
  CreateAccessKeyCommand,
  AttachUserPolicyCommand,
} = require("@aws-sdk/client-iam");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");

// Configure AWS SDK v3
const awsConfig = {
  region: process.env.AWS_REGION,
  credentials: defaultProvider(),
};

const iamClient = new IAMClient(awsConfig);
const policyArn = "arn:aws:iam::aws:policy/AmazonSESFullAccess";

// Function to check if user exists
exports.checkIfUserExists = async function (userName) {
  try {
    const getUserCommand = new GetUserCommand({ UserName: userName });
    await iamClient.send(getUserCommand);
    return true; // User exists
  } catch (error) {
    if (error.name === "NoSuchEntityException") {
      return false; // User does not exist
    }
    throw new Error(`Error fetching user: ${error.message}`); // Other errors
  }
};

exports.userGenerator = async function (userName) {
  const userExists = await exports.checkIfUserExists(userName);
  if (userExists) {
    throw new Error(`User ${userName} already exists.`);
  }

  // Proceed to create user as user does not exist
  try {
    const createUserCommand = new CreateUserCommand({ UserName: userName });
    const createUserResponse = await iamClient.send(createUserCommand);
    console.log(`User created: ${createUserResponse.User.UserName}`);

    // Create access key for the user
    const createAccessKeyCommand = new CreateAccessKeyCommand({
      UserName: userName,
    });
    const accessKeyResponse = await iamClient.send(createAccessKeyCommand);

    // Attach policy to the user
    const attachUserPolicyCommand = new AttachUserPolicyCommand({
      PolicyArn: policyArn,
      UserName: userName,
    });
    await iamClient.send(attachUserPolicyCommand);
    console.log(
      `Policy ${policyArn} attached to user ${userName} successfully.`
    );

    // Return the access key information
    return {
      AccessKeyId: accessKeyResponse.AccessKey.AccessKeyId,
      SecretAccessKey: accessKeyResponse.AccessKey.SecretAccessKey,
    };
  } catch (creationError) {
    throw new Error(
      `Error creating user or attaching policy: ${creationError.message}`
    );
  }
};
