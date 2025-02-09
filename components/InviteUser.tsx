import { useState } from 'react';
import { inviteUserToList } from '../firebase/invite-user';
import { User } from 'firebase/auth';

const InviteUser = ({ user, listId }: { user: User; listId: string }) => {
  const [email, setEmail] = useState('');

  const handleInvite = async () => {
    if (!email) return;
    await inviteUserToList(user, email, listId);
    setEmail('');
  };

  return (
    <div className='flex flex-col gap-4 justify-items-center'>
      <input
        type='email'
        className='font-sans text-yellowPrimary'
        placeholder='Enter email to invite'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleInvite}>Invite</button>
    </div>
  );
};

export default InviteUser;
