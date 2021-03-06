const messageUtil = require('../utils/message');
const { MESSAGE, REMOVE_VIDEO } = require('./wsTypes');
const users = require('../store/users');
const rooms = require('../store/rooms');

function onRemoveVideo(socket, data) {
  const { videoUnique } = data;
  const { roomUnique } = socket.handshake.query;
  console.log(`[${roomUnique}] Requested ${REMOVE_VIDEO}`);

  const user = users.getById(socket.id); // const user = socket.getVisualsUser(socket.id);
  const room = rooms.getById(roomUnique); // const room = socket.getVisualsRoom(roomUnique);

  const newPlaylist = [];
  let toHistory = null;
  for (let j = 0; j < room.videos.playlist.length; j++) {
    const video = room.videos.playlist[j];
    // match room
    if (video.unique === videoUnique) {
      toHistory = video;
    } else {
      newPlaylist.push(video);
    }
  }

  if (!toHistory) return;

  room.videos.playlist = newPlaylist;
  room.videos.history.push(toHistory);

  const messageResponse = messageUtil.createUserMessage(
    toHistory,
    user,
    messageUtil.MESSAGE_VIDEO_DELETE
  );

  room.messages.push(messageResponse);
  rooms.update(roomUnique, room); // socket.updateVisualsRoom(roomUnique, room);
  socket.sendToRoom(roomUnique, MESSAGE, messageResponse);
  socket.sendToRoom(roomUnique, REMOVE_VIDEO, {
    toHistory,
    removeFromQue: videoUnique,
    requestedBy: user,
  });
}

module.exports = onRemoveVideo;
