import {Dispatch} from 'redux'
import {SetAppErrorActionType, setAppStatusAC, SetAppStatusActionType} from '../../app/app-reducer'
import {authAPI, FieldError, LoginParamsType} from '../../api/todolists-api'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {AxiosError} from "axios";



export const loginTC = createAsyncThunk<undefined,LoginParamsType,{
    rejectValue:{errors: Array<string>, fieldsError?: Array<FieldError>}
} >("auth/login", async (data: LoginParamsType, thunkAPI)=>{
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}))
   try {const res = await authAPI.login(data)
            if (res.data.resultCode === 0) {
                thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))
                return;
            } else {
                handleServerAppError(res.data, thunkAPI.dispatch)
                return thunkAPI.rejectWithValue({errors:res.data.messages, fieldsError : res.data.fieldErrors})
            }} catch(err) {
        const error:AxiosError=err
            handleServerNetworkError(error, thunkAPI.dispatch)
       return thunkAPI.rejectWithValue({errors:[error.message], fieldsError : undefined})
        }
})
export const logoutTC = createAsyncThunk("auth/logout", async (param,thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}))
       try{
           const res = await authAPI.logout()
           if (res.data.resultCode === 0) {
                thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))
               return;
            } else {
                handleServerAppError(res.data, thunkAPI.dispatch)
               return thunkAPI.rejectWithValue({})
            }
        } catch(error)
    {
        handleServerNetworkError(error, thunkAPI.dispatch)
        return thunkAPI.rejectWithValue({})
    }
        })

const slice = createSlice({
    name: 'auth',
    initialState: {
        isLoggedIn: false
    },
    reducers: {
        setIsLoggedInAC(state, action: PayloadAction<{value: boolean}>) {
            state.isLoggedIn = action.payload.value
        }
    },
    extraReducers: builder => {
        builder.addCase(loginTC.fulfilled,(state)=>{
                state.isLoggedIn = true}
        )
        builder.addCase(logoutTC.fulfilled,(state)=>{
            state.isLoggedIn = false}
        )
    },


})

export const authReducer = slice.reducer

// thunks

export const {setIsLoggedInAC} = slice.actions


