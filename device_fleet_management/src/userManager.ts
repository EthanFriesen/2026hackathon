export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
}

export class UserManager {

    // Use map to store users, so retrievel is quick.
    private users: Map<string, User>;

    constructor() {
        this.users = new Map<string, User>();
    }

    addUser(user: User): void {
      if(this.users.has(user.id)) {
        throw new Error(`User with id ${user.id} already exists`);
      }
      else if(user.id === "") {
        throw new Error("User must have an id");
      }
      else {
        this.users.set(user.id, user);
      }
    }

    removeUser(id: string): void {
      if(!this.users.has(id)) {
        throw new Error(`User with id ${id} not found`);
      }
      else if (id === "") {
        throw new Error("User must have an id");
      }
      else {
        this.users.delete(id);
      }
    }

    getUser(id: string): User | null {
      if (!this.users.has(id) || id === "") {
        return null;
      }
      else {
        return this.users.get(id) || null;
      }
    }

    getUsersByEmail(email: string): User[] | null {
      if (email === "") {
        return null;
      }
      else {
        const result: User[] = [];
        for (const user of this.users.values()) {
          if (user.email === email) {
            result.push(user);
          }
        }
        return result;
      }
    }

    getUsersByPhone(phone: string): User[] | null {
      if (phone === "") {
        return null;
      }
      else {
        const result: User[] = [];
        for (const user of this.users.values()) {
          if (user.phone === phone) {
            result.push(user);
          }
        }
        return result;
      }
    }

    getAllUsers(): User[] {
        return Array.from(this.users.values()); // Map is values from id as the key, so can just return the values as an array.
    }

    getUserCount(): number {
        return this.users.size;
    }
}
