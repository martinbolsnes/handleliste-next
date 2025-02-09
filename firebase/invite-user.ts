import { db } from './config/firebase.config';
import { collection, addDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

export const inviteUserToList = async (
  sender: User,
  receiverEmail: string,
  listId: string
) => {
  if (!sender || !receiverEmail || !listId) return;

  try {
    await addDoc(collection(db, 'invitations'), {
      senderId: sender.uid,
      senderEmail: sender.email,
      receiverEmail,
      listId,
      status: 'pending',
      createdAt: new Date(),
    });
    console.log('Invitation sent!');
  } catch (error) {
    console.error('Error sending invitation:', error);
  }
};
