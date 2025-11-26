// src/app/api/index.ts
import express from 'express';
import { petsHandlers } from './pets/route';
import ngoRouter from './ngos/route';
import animalSheltersRouter from './animal-shelters/route';

const router = express.Router();

// Pets routes
router.get('/pets', petsHandlers.getPets);
router.post('/pets', petsHandlers.createPet);
router.patch('/pets', petsHandlers.updatePet);
router.delete('/pets', petsHandlers.deletePet);

// NGO routes
router.use('/ngos', ngoRouter);

// Animal Shelters routes
router.use('/animal-shelters', animalSheltersRouter);

export default router;