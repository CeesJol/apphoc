import executeQuery from "../../lib/executeQuery";
import stringifyObject from "../../lib/stringifyObject";
import {
  DEFAULT_CATEGORIES,
  COOKIE_MAX_AGE,
  convertToTemplate,
} from "../../lib/constants";
import jwt from "jsonwebtoken";
import {
  validateSignup,
  validateLogin,
  validatePassword,
} from "../../lib/validate";

const POST_DATA = `_id
title
location
date
description
user {
	_id
}`;

// User data request data used by getUserByEmail and readUser
const USER_DATA = `_id
username
email
posts {
	data {
		${POST_DATA}
	}
}`;

/** |----------------------------
 *  | USER
 *  |----------------------------
 */
export const loginUser = ({ email, password }) => {
  console.log("loginUser request");
  email = email.toLowerCase();
  const validationError = validateLogin(email, password);
  if (validationError) return [{ message: validationError }];
  return executeQuery(
    `mutation LoginUser {
			loginUser(email:"${email}", password: "${password}") {
				token
				user {
					${USER_DATA}
				}
			}
		}`,
    process.env.FAUNADB_SECRET_KEY
  );
};

export const logoutUser = (secret) => {
  console.log("logoutUser request");
  return executeQuery(
    `mutation LogoutUser {
			logoutUser
		}`,
    secret
  );
};

export const createUser = ({ email, username, password }) => {
  console.log("createUser request");
  email = email.toLowerCase();
  const validationError = validateSignup(email, username, password);
  if (validationError) return [{ message: validationError }];
  return executeQuery(
    `mutation CreateUser {
			createUser(email: "${email}", username: "${username}", password: "${password}") {
				_id
				username
				email
			}
		}`,
    process.env.FAUNADB_SECRET_KEY
  );
};

export const updateUser = async ({ id, data }, secret) => {
  console.log("updateUser request", id, data);
  if (data.email) data.email.toLowerCase();
  const { pairs, keys } = stringifyObject(data);
  return executeQuery(
    `mutation UpdateUser {
			updateUser(id: "${id}", data: {
				${pairs}
			}) {
				_id
				${keys}
			}
		}`,
    secret
  );
};

export const readUser = async ({ id }, secret) => {
  console.log("readUser request");
  return executeQuery(
    `query FindAUserByID {
			findUserByID(id: "${id}") {
				${USER_DATA}
			}
		}`,
    secret
  );
};

export const getUserByEmail = async ({ email }, secret) => {
  console.log("getUserByEmail request");
  email = email.toLowerCase();
  return executeQuery(
    `query FindAUserByEmail {
			userByEmail(email: "${email}") {
				${USER_DATA}
			}
		}`,
    secret
  );
};

/** |----------------------------
 *  | POSTS
 *  |----------------------------
 */
export const getPosts = async () => {
  console.log("getPosts request");
  return executeQuery(
    `query getPosts {
			posts {
				data {
					${POST_DATA}
				}
			}
		}`,
    process.env.FAUNADB_SECRET_KEY
  );
};

export const createPost = async ({ userId, data }, secret) => {
  console.log("createPost request");
  const { pairs, keys } = stringifyObject(data);

  return executeQuery(
    `mutation CreatePost {
			createPost(data: {
				${pairs}
				user: { connect: "${userId}" }
			}) {
				_id
				user {
					_id
				}
				${keys}
			}
		}`,
    secret
  );
};

export const updatePost = async ({ id, data }, secret) => {
  console.log("updatePost request", id, data);
  const { pairs, keys } = stringifyObject(data);
  return executeQuery(
    `mutation UpdatePost {
			updatePost(id: "${id}", data: {
				${pairs}
			}) {
				_id
				${keys}
			}
		}`,
    secret
  );
};

export const deletePost = async ({ id }, secret) => {
  console.log("deletePost request");
  return executeQuery(
    `mutation DeletePost {
			deletePost(id: "${id}") {
				_id
			}
		}`,
    secret
  );
};

/** |----------------------------
 *  | MISC
 *  |----------------------------
 */

export const faultyQuery = async () => {
  console.log("faultyQuery request");
  // try {
  //   throw new Error("NO.");
  // } catch (err) {
  //   return [{ message: "Confirm user error:" + err }];
  // }

  return executeQuery(
    `query PlausibleError{
			plausibleError {
				_id
			}
		}`,
    process.env.FAUNADB_SECRET_KEY
  );
};

// Source
// https://stackoverflow.com/questions/10730362/get-cookie-by-name
function getCookie(name, cookies) {
  const value = `; ${cookies}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

const fauna = async (req, res) => {
  const deleteCookie = () => {
    // Delete secret cookie
    res.setHeader("Set-Cookie", [
      `secret=deleted; expires=Thu, 01 Jan 1970 00:00:00 GMT`,
    ]);
  };
  const userSecretEncrypted = getCookie("secret", req.headers.cookie);
  let userSecret;
  let result;
  if (userSecretEncrypted) {
    try {
      userSecret = jwt.verify(userSecretEncrypted, process.env.COOKIE_SECRET)
        .token;
    } catch (e) {
      console.log("Error: invalid authentication token: ", e);
      deleteCookie();
      result = [{ message: "Error: invalid authentication token" }];
      res.end(JSON.stringify(result));
      return;
    }
  }
  const { type } = req.body;

  try {
    switch (type) {
      // ----------
      // USERS
      // ----------
      case "LOGIN_USER":
        result = await loginUser(req.body);
        // If no validation error, set cookie
        if (!result[0]) {
          // Set secret cookie
          const encryptedToken = jwt.sign(
            {
              token: result.loginUser.token,
            },
            process.env.COOKIE_SECRET
          );
          res.setHeader("Set-Cookie", [
            `secret=${encryptedToken}; HttpOnly; Max-Age=${COOKIE_MAX_AGE}`,
          ]);
          // Don't send token to user
          result = result.loginUser.user;
        }
        break;
      case "LOGOUT_USER":
        result = await logoutUser(userSecret);
        deleteCookie();
        break;
      case "CREATE_USER":
        result = await createUser(req.body);
        break;
      case "UPDATE_USER":
        result = await updateUser(req.body, userSecret);
        break;
      case "READ_USER":
        result = await readUser(req.body, userSecret);
        break;
      case "GET_USER_BY_EMAIL":
        result = await getUserByEmail(req.body, userSecret);
        break;
      // ----------
      // POSTS
      // ----------
      case "GET_POSTS":
        result = await getPosts();
        break;
      case "CREATE_POST":
        result = await createPost(req.body, userSecret);
        break;
      case "UPDATE_POST":
        result = await updatePost(req.body, userSecret);
        break;
      case "DELETE_POST":
        result = await deletePost(req.body, userSecret);
        break;
      // ----------
      // MISC
      // ----------
      case "FAULTY_QUERY":
        result = await faultyQuery();
        break;
      default:
        result = [{ message: "Error: No such type in /api/fauna: " + type }];
    }
  } catch (e) {
    result = [{ message: e }];
  }
  res.end(JSON.stringify(result));
};

export default fauna;
