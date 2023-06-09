import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../../api/todolists-api'
import {AppRootStateType} from '../../app/store'
import {setAppStatusAC} from '../../app/app-reducer'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {addTodolistTC, fetchTodolistsTC, removeTodolistTC} from "./todolists-reducer";

const initialState: TasksStateType = {}


export const fetchTasksTC = createAsyncThunk("tasks/fetchTasks", async (todolistId: string, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}))
    try {
        const res = await todolistsAPI.getTasks(todolistId)

        const tasks = res.data.items
        return {tasks, todolistId}
    } finally {
        thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))
    }
})
export const removeTaskTC = createAsyncThunk("tasks/removeTask", (param: { taskId: string, todolistId: string }, {
    dispatch,
    rejectWithValue
}) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    try {
        const res = todolistsAPI.deleteTask(param.todolistId, param.taskId)
        return {taskId: param.taskId, todolistId: param.todolistId}

    } finally {
        dispatch(setAppStatusAC({status: 'succeeded'}))
    }


})


export const addTaskTC =createAsyncThunk("tasks/addTask", async (param:{title: string, todolistId: string},{dispatch, rejectWithValue})=>{
    dispatch(setAppStatusAC({status: 'loading'}))
    try {
        const res = await todolistsAPI.createTask(param.todolistId, param.title)
        if (res.data.resultCode === 0) {
            const task = res.data.data.item
          return task

        } else {
            handleServerAppError(res.data, dispatch)
            return rejectWithValue(null)
        }
    } catch(error){
            handleServerNetworkError(error, dispatch)
        return rejectWithValue(null)
        }finally {
        dispatch(setAppStatusAC({status: 'succeeded'}))
    }

})


export const updateTaskTC = createAsyncThunk("tasks/updateTasks", async (param:{taskId: string, model: UpdateDomainTaskModelType, todolistId: string}, {dispatch, rejectWithValue,getState})=>{
    dispatch(setAppStatusAC({status: 'loading'}))
    const state = getState() as AppRootStateType
    const task = state.tasks[param.todolistId].find(t => t.id === param.taskId)
    if (!task) {
        //throw new Error("task not found in the state");
        console.warn('task not found in the state')
        return
    }

    const apiModel: UpdateTaskModelType = {
        deadline: task.deadline,
        description: task.description,
        priority: task.priority,
        startDate: task.startDate,
        title: task.title,
        status: task.status,
        ...param.model
    }
try {
        const res = await todolistsAPI.updateTask(param.todolistId, param.taskId, apiModel)
    if (res.data.resultCode === 0) {
      return param /*{taskId:param.taskId, model:apiModel, todolistId:param.todolistId}*/

    } else {
        handleServerAppError(res.data, dispatch)
        return rejectWithValue(null)
    }
}catch(error){
    handleServerNetworkError(error, dispatch)
    return rejectWithValue(null)
}finally {
    dispatch(setAppStatusAC({status: 'succeeded'}))
}
})




const slice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder.addCase(addTaskTC.fulfilled, (state, action) => {
            state[action.payload.todoListId].unshift(action.payload)
        }); builder.addCase(addTodolistTC.fulfilled, (state, action) => {
            state[action.payload.todolist.id] = [];
        });
        builder.addCase(removeTodolistTC.fulfilled, (state, action) => {
            delete state[action.payload.id];
        });
        builder.addCase(fetchTodolistsTC.fulfilled, (state, action) => {
            action.payload.todolists.forEach((tl: any) => {
                state[tl.id] = []
            })
        });
        builder.addCase(fetchTasksTC.fulfilled, (state, action) => {
            state[action.payload.todolistId] = action.payload.tasks
        });
        builder.addCase(removeTaskTC.fulfilled, (state, action) => {
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(t => t.id === action.payload.taskId)
            if (index > -1) {
                tasks.splice(index, 1)
            }
        })
        builder.addCase(updateTaskTC.fulfilled,(state,action)=>{
            if (action.payload) {
                const tasks = state[action.payload.todolistId]
                const index = tasks.findIndex(t => t.id === action.payload?.taskId)
                if (index > -1) {
                    tasks[index] = {...tasks[index], ...action.payload.model}
                }
            }
        })
    }
})

export const tasksReducer = slice.reducer

// actions


// thunks


// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = {
    [key: string]: Array<TaskType>
}

