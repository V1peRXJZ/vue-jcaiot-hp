import { Document, Schema } from 'mongoose';
import { LogEntry } from '@nestjs/common/interfaces/external/kafka-options.interface';


export class AddUserDTO {
    readonly username: string;
    readonly admin: string;
    readonly password: string;
    readonly email: string;
}

export interface User extends Document {
    username?: string;
    admin?: string;
    password?: string;
    email?: string;
}


export const UserSchema = new Schema({
    username: {
        type: String
    },
    admin: {
        type: String
    },
    password: {
        type: String
    },
    email: {
        type: String
    }
});
