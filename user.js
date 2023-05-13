const redis = require("redis");
const client = redis.createClient();

exports.addUser = ({ id, name, room }) => {
  if (!name || !room) return { error: "name and room required." };

  // Store user details in Redis
  const user = { id, name, room };
  client.hmset(`user:${id}`, user);
  client.sadd(`room:${room}:users`, id);

  return { user };
};
