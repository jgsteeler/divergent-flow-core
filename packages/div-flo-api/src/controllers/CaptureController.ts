// =========================
// CaptureController
// =========================
import { Router, Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { ICaptureService } from '@div-flo/models';

@injectable()
export class CaptureController {
  private router: Router;

  constructor(
    @inject('ICaptureService') private captureService: ICaptureService
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post('/', this.createCapture.bind(this));
    this.router.get('/:id', this.getCapture.bind(this));
    this.router.put('/:id', this.updateCapture.bind(this));
    this.router.delete('/:id', this.deleteCapture.bind(this));
    this.router.get('/user/:userId', this.listCapturesByUser.bind(this));
  }

  /**
   * @swagger
   * /v1/capture:
   *   post:
   *     summary: Create a new capture
   *     tags: [Capture]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Capture'
   *     responses:
   *       201:
   *         description: Capture created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Capture'
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  private async createCapture(req: Request, res: Response): Promise<void> {
    try {
      const capture = await this.captureService.createCapture(req.body);
      res.status(201).json(capture);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @swagger
   * /v1/capture/{id}:
   *   get:
   *     summary: Get a capture by ID
   *     tags: [Capture]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: Capture ID
   *     responses:
   *       200:
   *         description: Capture found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Capture'
   *       404:
   *         description: Capture not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  private async getCapture(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const capture = await this.captureService.getCaptureById(id);
    if (capture) {
      res.json(capture);
    } else {
      res.status(404).json({ error: 'Capture not found' });
    }
  }

  /**
   * @swagger
   * /v1/capture/{id}:
   *   put:
   *     summary: Update a capture
   *     tags: [Capture]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: Capture ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Capture'
   *     responses:
   *       200:
   *         description: Capture updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Capture'
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  private async updateCapture(req: Request, res: Response): Promise<void> {
    try {
      const updated = await this.captureService.updateCapture({ ...req.body, id: req.params.id });
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @swagger
   * /v1/capture/{id}:
   *   delete:
   *     summary: Delete a capture
   *     tags: [Capture]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: Capture ID
   *     responses:
   *       204:
   *         description: Capture deleted
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  private async deleteCapture(req: Request, res: Response): Promise<void> {
    try {
      await this.captureService.deleteCapture(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @swagger
   * /v1/capture/user/{userId}:
   *   get:
   *     summary: List all captures for a user
   *     tags: [Capture]
   *     parameters:
   *       - in: path
   *         name: userId
   *         schema:
   *           type: string
   *         required: true
   *         description: User ID to filter captures
   *     responses:
   *       200:
   *         description: List of captures
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Capture'
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  private async listCapturesByUser(req: Request, res: Response): Promise<void> {
    try {
      const captures = await this.captureService.listCapturesByUser(req.params.userId);
      res.json(captures);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @swagger
   * components:
   *   schemas:
   *     Capture:
   *       type: object
   *       properties:
   *         id:
   *           type: string
   *         userId:
   *           type: string
   *         rawText:
   *           type: string
   *         createdAt:
   *           type: string
   *           format: date-time
   *         updatedAt:
   *           type: string
   *           format: date-time
   *         migratedDate:
   *           type: string
   *           format: date-time
   *           nullable: true
   *     Error:
   *       type: object
   *       properties:
   *         error:
   *           type: string
   */
  public getRouter(): Router {
    return this.router;
  }
}
