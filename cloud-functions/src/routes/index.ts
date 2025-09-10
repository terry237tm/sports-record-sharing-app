import { Router } from 'express'
import usersRouter from './users'
import recordsRouter from './records'

const router = Router()

// 用户相关路由
router.use('/users', usersRouter)

// 运动记录相关路由
router.use('/records', recordsRouter)

export default router