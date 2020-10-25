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
status
user {
	_id
}
offers {
	data {
		_id
		username
	}
}`;

// User data request data used by getUserByEmail and readUser
const USER_DATA = `_id
username
email
`;

/** |----------------------------
 *  | USER
 *  |----------------------------
 */
export const loginUser = ({ email, password }) => {
  console.info("loginUser request");
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
  console.info("logoutUser request");
  return executeQuery(
    `mutation LogoutUser {
			logoutUser
		}`,
    secret
  );
};

export const createUser = ({ email, username, password }) => {
  console.info("createUser request");
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
  console.info("updateUser request", id, data);
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
  console.info("readUser request");
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
  console.info("getUserByEmail request");
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
  console.info("getPosts request");
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
  console.info("createPost request");
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
  console.info("updatePost request");
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
  console.info("deletePost request");
  return executeQuery(
    `mutation DeletePost {
			deletePost(id: "${id}") {
				_id
			}
		}`,
    secret
  );
};

export const createOffer = async ({ postId, userId }) => {
  console.info("createOffer request");
  return executeQuery(
    `mutation AddOffer {
			updatePost(id: "${postId}", data: {
				offers: { connect: "${userId}"}
			}) {
				_id
				offers {
					data {
						_id
						username
					}
				}
				title
			}
		}`,
    process.env.FAUNADB_SECRET_KEY
  );
};

export const removeOffer = async ({ postId, userId }) => {
  console.info("removeOffer request");
  return executeQuery(
    `mutation RemoveOffer {
			updatePost(id: "${postId}", data: {
				offers: { disconnect: "${userId}"}
			}) {
				_id
				offers {
					data {
						_id
						username
					}
				}
				title
			}
		}`,
    process.env.FAUNADB_SECRET_KEY
  );
};

/** |----------------------------
 *  | MISC
 *  |----------------------------
 */

export const faultyQuery = async () => {
  console.info("faultyQuery request");
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
      console.info("Error: invalid authentication token: ", e);
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
      case "CREATE_OFFER":
        result = await createOffer(req.body);
        break;
      case "REMOVE_OFFER":
        result = await removeOffer(req.body);
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
    // Magic to stringify error using JSON.stringify
    // Source
    // https://stackoverflow.com/questions/18391212/is-it-not-possible-to-stringify-an-error-using-json-stringify
    if (!("toJSON" in Error.prototype))
      Object.defineProperty(Error.prototype, "toJSON", {
        value: function () {
          var alt = {};

          Object.getOwnPropertyNames(this).forEach(function (key) {
            alt[key] = this[key];
          }, this);

          return alt;
        },
        configurable: true,
        writable: true,
      });

    result = [e];
  }
  res.end(JSON.stringify(result));
};

export default fauna;
