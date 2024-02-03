type Status = "normal" | "success" | "error";

interface User {
  username: string | undefined;
  avatar: string | undefined;
  name: string | undefined;
}

interface Message {
  text: string | undefined;
  status: Status;
}

function getImageUrl(baseUrl: string, user: User, message: Message): string {
  const imageParams = {
    targetUsername: user.username || "",
    targetAvatar: user.avatar || "",
    targetName: user.name || "",
    messageText: message.text || "",
    messageStatus: message.status,
  };
  const urlParams = new URLSearchParams(imageParams);
  const imageUrl = new URL(`${baseUrl}/api/frame/tips/image`);
  imageUrl.search = urlParams.toString();
  return imageUrl.toString();
}

export { getImageUrl };
export type { Status, User, Message };
