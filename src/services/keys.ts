export const pageCacheKey = (id: string) => `pageCache#${id}`;

export const sessionKey = (sessionId: string) => `sessions#${sessionId}`; 

export const itemKey = (itemId: string) => `items#${itemId}`; 
export const itemsByViewsKey = () => 'items:views'; 

export const usersKey = (userId: string) => `users#${userId}`; 
export const usernamesUniqueKey = () => 'usernames#:unique';
export const usernamesKey= () => 'usernames';
export const userLikesKey = (userId: string) => `users:likes#:${userId}`;  
