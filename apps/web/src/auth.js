/**
 * WARNING: This file connects this app to Anythings's internal auth system. Do
 * not attempt to edit it. Modifying it will have no effect on your project as it is controlled by our system.
 * Do not import @auth/create or @auth/create anywhere else or it may break. This is an internal package.
 */
import CreateAuth from "@auth/create"
import Credentials from "@auth/core/providers/credentials"
import { CredentialsSignin } from '@auth/core/errors'
import { getDb } from './app/api/utils/mongodb'
import { hash, verify } from 'argon2'

function Adapter() {
  return {
    async createVerificationToken(verificationToken) {
      const db = await getDb();
      await db.collection('auth_verification_tokens').insertOne(verificationToken);
      return verificationToken;
    },
    async useVerificationToken({ identifier, token }) {
      const db = await getDb();
      const tokenDoc = await db.collection('auth_verification_tokens').findOne({ identifier, token });
      if (tokenDoc) {
        await db.collection('auth_verification_tokens').deleteOne({ identifier, token });
      }
      return tokenDoc;
    },
    async createUser(user) {
      const db = await getDb();
      const { name, email, emailVerified, image } = user;
      const id = Math.floor(Math.random() * 10000000) + 1;
      const newUser = { id, name, email, emailVerified, image };
      await db.collection('auth_users').insertOne(newUser);
      return newUser;
    },
    async getUser(id) {
      const db = await getDb();
      const queryId = typeof id === 'string' ? (parseInt(id) || id) : id;
      try {
        const user = await db.collection('auth_users').findOne({ id: queryId });
        return user;
      } catch {
        return null;
      }
    },
    async getUserByEmail(email) {
      const db = await getDb();
      const user = await db.collection('auth_users').findOne({ email });
      if (!user) {
        return null;
      }
      const accounts = await db.collection('auth_accounts').find({ userId: user.id }).toArray();
      return {
        ...user,
        accounts,
      };
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const db = await getDb();
      const account = await db.collection('auth_accounts').findOne({ provider, providerAccountId });
      if (!account) return null;
      return db.collection('auth_users').findOne({ id: account.userId });
    },
    async updateUser(user) {
      const db = await getDb();
      const queryId = typeof user.id === 'string' ? (parseInt(user.id) || user.id) : user.id;
      const oldUser = await db.collection('auth_users').findOne({ id: queryId });
      const newUser = {
        ...oldUser,
        ...user,
      };
      const { id, ...updateFields } = newUser;
      await db.collection('auth_users').updateOne({ id: queryId }, { $set: updateFields });
      return db.collection('auth_users').findOne({ id: queryId });
    },
    async linkAccount(account) {
      const db = await getDb();
      const id = Math.floor(Math.random() * 10000000) + 1;
      const password = account.extraData?.password || account.password;
      const newAccount = {
        id,
        userId: account.userId,
        provider: account.provider,
        type: account.type,
        providerAccountId: account.providerAccountId,
        access_token: account.access_token || null,
        expires_at: account.expires_at || null,
        refresh_token: account.refresh_token || null,
        id_token: account.id_token || null,
        scope: account.scope || null,
        session_state: account.session_state || null,
        token_type: account.token_type || null,
        password: password || null,
      };
      await db.collection('auth_accounts').insertOne(newAccount);
      return newAccount;
    },
    async createSession({ sessionToken, userId, expires }) {
      if (userId === undefined) {
        throw Error('userId is undef in createSession');
      }
      const db = await getDb();
      const id = Math.floor(Math.random() * 10000000) + 1;
      const newSession = { id, userId, expires, sessionToken };
      await db.collection('auth_sessions').insertOne(newSession);
      return newSession;
    },
    async getSessionAndUser(sessionToken) {
      if (sessionToken === undefined) {
        return null;
      }
      const db = await getDb();
      const session = await db.collection('auth_sessions').findOne({ sessionToken });
      if (!session) {
        return null;
      }
      const user = await db.collection('auth_users').findOne({ id: session.userId });
      if (!user) {
        return null;
      }
      return {
        session,
        user,
      };
    },
    async updateSession(session) {
      const db = await getDb();
      const { sessionToken } = session;
      const originalSession = await db.collection('auth_sessions').findOne({ sessionToken });
      if (!originalSession) {
        return null;
      }
      const newSession = {
        ...originalSession,
        ...session,
      };
      await db.collection('auth_sessions').updateOne(
        { sessionToken },
        { $set: { expires: newSession.expires } }
      );
      return db.collection('auth_sessions').findOne({ sessionToken });
    },
    async deleteSession(sessionToken) {
      const db = await getDb();
      await db.collection('auth_sessions').deleteOne({ sessionToken });
    },
    async unlinkAccount(partialAccount) {
      const db = await getDb();
      const { provider, providerAccountId } = partialAccount;
      await db.collection('auth_accounts').deleteOne({ providerAccountId, provider });
    },
    async deleteUser(userId) {
      const db = await getDb();
      await db.collection('auth_users').deleteMany({ id: userId });
      await db.collection('auth_sessions').deleteMany({ userId });
      await db.collection('auth_accounts').deleteMany({ userId });
    },
  };
}

const adapter = Adapter();

export const { auth } = CreateAuth({
  providers: [Credentials({
  id: 'credentials-signin',
  name: 'Credentials Sign in',
  credentials: {
    email: {
      label: 'Email',
      type: 'email',
    },
    password: {
      label: 'Password',
      type: 'password',
    },
  },
  authorize: async (credentials) => {
    const { email, password } = credentials;
    if (!email || !password) {
      return null;
    }
    if (typeof email !== 'string' || typeof password !== 'string') {
      return null;
    }

    // logic to verify if user exists
    const user = await adapter.getUserByEmail(email);
    if (!user) {
      const error = new CredentialsSignin();
      error.code = 'no-account';
      throw error;
    }
    const matchingAccount = user.accounts.find(
      (account) => account.provider === 'credentials'
    );
    const accountPassword = matchingAccount?.password;
    if (!accountPassword) {
      throw new CredentialsSignin();
    }

    const isValid = await verify(accountPassword, password);
    if (!isValid) {
      throw new CredentialsSignin();
    }

    // return user object with the their profile data
    return user;
  },
}),
  Credentials({
  id: 'credentials-signup',
  name: 'Credentials Sign up',
  credentials: {
    email: {
      label: 'Email',
      type: 'email',
    },
    password: {
      label: 'Password',
      type: 'password',
    },
    name: { label: 'Name', type: 'text', required: false },
    image: { label: 'Image', type: 'text', required: false },
  },
  authorize: async (credentials) => {
    const { email, password } = credentials;
    if (!email || !password) {
      return null;
    }
    if (typeof email !== 'string' || typeof password !== 'string') {
      return null;
    }

    // logic to verify if user exists
    const user = await adapter.getUserByEmail(email);
    if (!user) {
      const newUser = await adapter.createUser({
        emailVerified: null,
        email,
        name:
          typeof credentials.name === 'string' &&
          credentials.name.trim().length > 0
            ? credentials.name
            : undefined,
        image:
          typeof credentials.image === 'string'
            ? credentials.image
            : undefined,
      });
      await adapter.linkAccount({
        extraData: {
          password: await hash(password),
        },
        type: 'credentials',
        userId: newUser.id,
        providerAccountId: newUser.id.toString(),
        provider: 'credentials',
      });
      return newUser;
    }
    return null;
  },
})],
  pages: {
    signIn: '/account/signin',
    signOut: '/account/logout',
  },
})