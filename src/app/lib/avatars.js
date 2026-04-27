export const AVATAR_COUNT = 7;

export function getAvatarUrl(avatarId) {
  const id =
    Number.isInteger(avatarId) && avatarId >= 1 && avatarId <= AVATAR_COUNT
      ? avatarId
      : 1; // fallback keeps UI stable if data is ever missing
  return `/avatars/${id}.svg`;
}
