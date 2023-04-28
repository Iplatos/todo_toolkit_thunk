import {authAPI} from '../api/todolists-api'
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {setIsLoggedInAC} from "../features/Login/auth-reducer";

const initialState: InitialStateType = {
    status: 'idle',
    error: null,
    isInitialized: false
}

export const initializeAppTC =  createAsyncThunk("app/initialize", async(param, {dispatch}) => {
       const res = await authAPI.me()
       if (res.data.resultCode === 0) {
          dispatch(setIsLoggedInAC({value:true}))
       } else {

       }}
)

const slice = createSlice({
    name: 'app',
    initialState: initialState,
    reducers: {
        setAppStatusAC: (state, action: PayloadAction<{ status: RequestStatusType }>) => {
            state.status = action.payload.status
        },
        setAppErrorAC: (state, action: PayloadAction<{ error: string | null }>) => {
            state.error = action.payload.error
        },

    },
    extraReducers: builder => {
    builder.addCase(initializeAppTC.fulfilled, (state,action)=> {
        state.isInitialized = true
    })
    }

})

export const appReducer = slice.reducer

export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'
export type InitialStateType = {
    status: RequestStatusType
    error: string | null
    isInitialized: boolean
}

export const {setAppErrorAC, setAppStatusAC} = slice.actions



export type SetAppErrorActionType = ReturnType<typeof setAppErrorAC>
export type SetAppStatusActionType = ReturnType<typeof setAppStatusAC>

