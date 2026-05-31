import { configureStore } from '@reduxjs/toolkit'
import { useSelector, useDispatch } from "react-redux"
import User from './slices/user';
import Courses from './slices/courses';
const store = configureStore({
    reducer: {
        user: User,
        courses: Courses,
    }
})


export default store;
type Store = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<Store>()