import { Schema, model } from 'mongoose';
import { ToDoTag as ToDoTagInterface } from '../../types/todo';
import { ToDo as ToDoInterface } from '../../types/todo';
import { ToDo } from './ToDo';

const toDoTagSchema = new Schema<ToDoTagInterface>({
  clubId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: Date,
  updatedAt: Date,
});

toDoTagSchema.pre('remove', async function (next) {
  try {
    const toDoTag = this;
    const todos: ToDoInterface[] = await ToDo.find({ clubId: toDoTag.clubId });
    let usingTag: boolean = false;
    todos.forEach((todo) => {
      if (todo.tags.indexOf(toDoTag.name) >= 0) {
        usingTag = true;
      }
    });
    if (usingTag) next(Error('해당 태그를 사용하고 있는 일정이 있습니다.'));
    else next();
  } catch (error: any) {
    next(Error(error));
  }
});

const ToDoTag = model<ToDoTagInterface>('ToDoTag', toDoTagSchema);
export { ToDoTag, toDoTagSchema };
