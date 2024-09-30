class WebSockets {
  constructor() {
    this.users = [];
  }

  connection(client) {
    // When a user disconnects
    client.on('disconnect', () => {
      this.users = this.users.filter((user) => user.socketId !== client.id);
      console.log(`Client ${client.id} disconnected`);
    });

    // When a user identifies themselves (log in, for example)
    client.on('identity', (userId) => {
      if (userId) {
        this.users.push({
          socketId: client.id,
          userId: userId,
        });
        console.log(`User ${userId} connected with socket ID ${client.id}`);
      }
    });

    // User subscribes to a room
    client.on('subscribe', (room, otherUserId = '') => {
      client.join(room);
      console.log(`Client ${client.id} joined room ${room}`);
      if (otherUserId) {
        this.subscribeOtherUser(room, otherUserId);
      }
    });

    // User unsubscribes from a room
    client.on('unsubscribe', (room) => {
      client.leave(room);
      console.log(`Client ${client.id} left room ${room}`);
    });
  }

  subscribeOtherUser(room, otherUserId) {
    // Find all sockets for the other user
    const userSockets = this.users.filter(
      (user) => user.userId === otherUserId,
    );

    userSockets.forEach((userInfo) => {
      const socketConn = global.io.sockets.sockets.get(userInfo.socketId);

      // Join the room only if the socket connection exists
      if (socketConn) {
        socketConn.join(room);
        console.log(
          `User ${otherUserId} joined room ${room} through socket ${userInfo.socketId}`,
        );
      }
    });
  }
}

module.exports = new WebSockets();
