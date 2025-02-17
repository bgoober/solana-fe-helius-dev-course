import * as borsh from "@project-serum/borsh";
import { StudentIntroReference } from "./StudentIntroReference";

// create a class with a name and message string, export it so other files can import it
export class StudentIntro {
  name: string;
  message: string;

  // constructor to build an object of this StudentIntro class, with name and message as inputs from the user
  constructor(name: string, message: string) {
    this.name = name;
    this.message = message;
  }

  // serialization schema using a borsh struct -- instance property
  borshInstructionSchema = borsh.struct([
    borsh.u8("variant"),
    borsh.str("name"),
    borsh.str("message"),
  ]);

  // static property that can be used on the class itself, not an instance
  static borshAccountScheme = borsh.struct([
    borsh.u8("initialized"),
    borsh.str("name"),
    borsh.str("message"),
  ]);

  // serialize the info when we send it to the blockchain
  serialize(): Buffer {
    // create a buffer of 1000 bits
    const buffer = Buffer.alloc(1000);
    // serialize the object's properties using the schema and a variant field
    this.borshInstructionSchema.enconde({ ...this, variant: 0 }, buffer);
    // slice the buffer to the exact size of the object
    return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer));
  }

  // derserialize info when we retrieve it from the blockchain
  static deserialize(buffer?: Buffer): StudentIntroReference | null {
    if (!buffer) {
      // if no buffer return null
      return null;
    }

    // try to return the deserialized object, handle any errors
    try {
      const { name, message } = this.borshAccountScheme.decode(buffer);
      return new StudentIntroReference(name, message);
    } catch (error) {
      console.log("Deserialization error:", error);
      return null;
    }
  }
}

/*
    Class Structure: It includes two properties, name and message, 
    which are strings. The constructor initializes these properties.

    Borsh Schemas: Two Borsh schemas are defined - one for instructions 
    (borshInstructionSchema) and one for accounts (borshAccountSchema). These schemas 
    specify the data structure for serialization/deserialization.

    Serialization: The serialize method converts the instance data into a 
    binary format (buffer) that can be sent to the blockchain. It uses the borshInstructionSchema.

    Deserialization: The deserialize static method converts binary data from 
    the blockchain back into an instance of StudentIntroReference. It uses the borshAccountSchema.
*/
