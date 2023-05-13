const redis = require("redis");
const client = redis.createClient();

exports.addUser = ({ id, name, room }) => {
  if (!name || !room) return { error: "name and room required." };

  // Store user details in Redis
  const user = { id, name, room };
  client.sAdd(`user:${id}`, user);
  client.sAdd(`room:${room}:users`, id);

  return { user };
};
