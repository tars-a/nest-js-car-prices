import { Entity, Column, PrimaryGeneratedColumn, AfterUpdate, AfterInsert, AfterRemove } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @AfterInsert()
  afterInsert () {
    console.log("User inserted with id", this.id);
  }

  @AfterUpdate()
  afterUpdate () {
    console.log("User updated with id", this.id);
  }

  @AfterRemove()
  afterRemove () {
    console.log("User removed with id", this.id);
  }
}