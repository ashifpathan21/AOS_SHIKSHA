import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface ICourse {
    id: Number
}

export interface ICourses {
    publicCourses: ICourse[],
    userCourses: ICourse[],
    enrolledCourses: ICourse[]
}

export interface ICourseOp {
    courses: ICourse[],
    type: "public" | "user" | "enrolled",
    course: ICourse | undefined
}

const initialState: ICourses = {
    publicCourses: [],
    userCourses: [],
    enrolledCourses: []
}


const courseSlice = createSlice({
    name: "courses",
    initialState,
    reducers: {
        setAllCourses: (state, action: PayloadAction<ICourses>) => {
            state.publicCourses = action.payload.publicCourses;
            state.userCourses = action.payload.userCourses;
            state.enrolledCourses = action.payload.enrolledCourses
        },
        setCourses: (state, action: PayloadAction<ICourseOp>) => {
            const type = action.payload.type;
            if (type === 'public')
                state.publicCourses = action.payload.courses;
            else if (type === 'user')
                state.userCourses = action.payload.courses;
            else if (type === 'enrolled')
                state.enrolledCourses = action.payload.courses;
        },
        resetAllCourses: (state) => {
            state.enrolledCourses = [];
            state.publicCourses = [];
            state.userCourses = [];
        },
        resetCourses: (state, action: PayloadAction<ICourseOp>) => {
            const type = action.payload.type;
            if (type === 'public')
                state.publicCourses = [];
            else if (type === 'user')
                state.userCourses = [];
            else if (type === 'enrolled')
                state.enrolledCourses = [];
        },
        addCourse: (state, action: PayloadAction<ICourseOp>) => {
            const type = action.payload.type;
            if (action.payload.course)
                if (type === 'public')
                    state.publicCourses.push(action.payload.course);
                else if (type === 'user')
                    state.userCourses.push(action.payload.course);
                else if (type === 'enrolled')
                    state.enrolledCourses.push(action.payload.course);
        },
        removeCourse: (state, action: PayloadAction<ICourseOp>) => {
            const type = action.payload.type;
            if (action.payload.course)
                if (type === 'public')
                    state.publicCourses = state.publicCourses.filter(course => course?.id !== action.payload.course?.id)
                else if (type === 'user')
                    state.userCourses = state.userCourses.filter(course => course?.id !== action.payload.course?.id)
                else if (type === 'enrolled')
                    state.enrolledCourses = state.enrolledCourses.filter(course => course?.id !== action.payload.course?.id)
        }
    }
})

export const { addCourse, removeCourse, resetAllCourses, resetCourses, setAllCourses, setCourses } = courseSlice.actions
export default courseSlice.reducer;
