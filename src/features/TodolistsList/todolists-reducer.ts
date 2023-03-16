import {todolistsAPI, TodolistType} from '../../api/todolists-api'
import {RequestStatusType, setAppStatusAC} from '../../app/app-reducer'
import {handleServerNetworkError} from '../../utils/error-utils'
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'

const initialState: Array<TodolistDomainType> = []


export const fetchTodolistsTC = createAsyncThunk("todolists/fetchTodolists", async (param, {
    dispatch,
    rejectWithValue
}) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    try {
        const res = await todolistsAPI.getTodolists()
        dispatch(setAppStatusAC({status: 'succeeded'}))
        return {todolists: res.data}


    } catch (error) {
        handleServerNetworkError(error, dispatch)
        return rejectWithValue(null)
    }
})
export const removeTodolistTC = createAsyncThunk("todolist/removeTodolist", async (todolistId: string, {
    dispatch,
    rejectWithValue
}) => {
    //изменим глобальный статус приложения, чтобы вверху полоса побежала
    dispatch(setAppStatusAC({status: 'loading'}))
    //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
    dispatch(changeTodolistEntityStatusAC({id: todolistId, status: 'loading'}))

    try {
        const res = await todolistsAPI.deleteTodolist(todolistId)
        return {id: todolistId}
    } catch (error) {
        handleServerNetworkError(error, dispatch)
        return rejectWithValue(null)
    } finally {
        dispatch(setAppStatusAC({status: 'succeeded'}))
    }
})

export const addTodolistTC = createAsyncThunk("todolist/addTodolist", async (title: string, {dispatch,rejectWithValue}) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    try {
        const res = await todolistsAPI.createTodolist(title)

        return{todolist: res.data.data.item}
    } catch (error) {
        handleServerNetworkError(error, dispatch)
        return rejectWithValue(null)
    }finally {
        dispatch(setAppStatusAC({status: 'succeeded'}))
    }
})
export const changeTodolistTitleTC =createAsyncThunk("todolist/changeTodolisTitle",(param:{id: string, title: string}, {dispatch,rejectWithValue}) => {
    dispatch(setAppStatusAC({status: 'loading'}))
       try{
         const res =  todolistsAPI.updateTodolist(param.id, param.title)
         return {id: param.id, title:param.title}
       }catch (error){
           handleServerNetworkError(error, dispatch)
           return rejectWithValue(null)
       }finally {
           dispatch(setAppStatusAC({status: 'succeeded'}))
       }

})


const slice = createSlice({
    name: 'todolists',
    initialState: initialState,
    reducers: {
        changeTodolistFilterAC(state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) {
            const index = state.findIndex(tl => tl.id === action.payload.id);
            state[index].filter = action.payload.filter;
        },
        changeTodolistEntityStatusAC(state, action: PayloadAction<{ id: string, status: RequestStatusType }>) {
            const index = state.findIndex(tl => tl.id === action.payload.id);
            state[index].entityStatus = action.payload.status;
        },
    },
    extraReducers: builder => {
        builder.addCase(fetchTodolistsTC.fulfilled, (state, action) => {
            return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
        });
        builder.addCase(removeTodolistTC.fulfilled, (state, action) => {
            const index = state.findIndex(tl => tl.id === action.payload.id);
            if (index > -1) {
                state.splice(index, 1);
            }
        });
        builder.addCase(addTodolistTC.fulfilled, (state, action) => {
            state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'})
    });
        builder.addCase(changeTodolistTitleTC.fulfilled,(state,action)=>{
            const index = state.findIndex(tl => tl.id === action.payload.id);
            state[index].title = action.payload.title;
        })
}})

export const todolistsReducer = slice.reducer
export const {
    changeTodolistFilterAC, changeTodolistEntityStatusAC
} = slice.actions

// thunks

// types

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}
