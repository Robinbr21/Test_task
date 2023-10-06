import { Router } from "express";

import { createController } from "../Controller/index.mjs";

const router = Router()
//task1
router.post('/',createController.index);
//task2
router.post('/twotable',createController.createtwotable);
router.post('/twotable',createController.finalResult);


export default router