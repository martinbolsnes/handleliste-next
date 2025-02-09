import { useEffect, useState } from 'react';
import { db } from '../firebase/config/firebase.config';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { User } from 'firebase/auth';

interface Invitation {
  id: string;
  senderEmail: string;
  listId: string;
  status: string;
}

const Invitations = ({ user }: { user: User }) => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchInvitations = async () => {
      const q = query(
        collection(db, 'invitations'),
        where('receiverEmail', '==', user.email),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      setInvitations(
        snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Invitation)
        )
      );
    };

    fetchInvitations();
  }, [user]);

  const acceptInvitation = async (invite: Invitation, user: User) => {
    try {
      // Update the invitation status
      await updateDoc(doc(db, 'invitations', invite.id), {
        status: 'accepted',
      });

      // Get the existing sharedWith list
      const listRef = doc(db, 'groceries', invite.listId);
      const listSnap = await getDoc(listRef);
      const currentSharedWith = listSnap.exists()
        ? listSnap.data()?.sharedWith || []
        : [];

      // Update Firestore document with new sharedWith array
      await updateDoc(listRef, {
        sharedWith: [...currentSharedWith, user.uid],
      });

      console.log('Invitation accepted and user added to the list!');
    } catch (error) {
      console.error('Error accepting invitation:', error);
    }
  };

  return (
    <div className='flex flex-col gap-4 justify-items-center'>
      <h2 className='font-sans text-yellowPrimary text-2xl'>
        Pending Invitations
      </h2>
      {invitations.length === 0 ? (
        <p className='font-sans text-yellowPrimary'>No pending invitations.</p>
      ) : (
        invitations.map((invite) => (
          <div key={invite.id}>
            <p className='font-sans text-yellowPrimary'>
              Invited by {invite.senderEmail}
            </p>
            <button onClick={() => acceptInvitation(invite, user)}>
              Accept
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default Invitations;
