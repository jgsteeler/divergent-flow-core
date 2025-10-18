// =========================
// UserController
// =========================
import { Router, Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IUserService } from '@div-flo/models';

@injectable()
export class UserController {
  private router: Router;

  constructor(
    @inject('IUserService') private userService: IUserService
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post('/', this.createUser.bind(this));
    this.router.get('/:id', this.getUser.bind(this));
    this.router.put('/:id', this.updateUser.bind(this));
    this.router.delete('/:id', this.deleteUser.bind(this));
    this.router.get('/email/:email', this.getUserByEmail.bind(this));
  }

  /**
   * @swagger
   * /v1/user:
   *   post:
   *     summary: Create a new user
   *     tags: [User]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/User'
   *     responses:
   *       201:
   *         description: User created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  private async createUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @swagger
   * /v1/user/{id}:
   *   get:
   *     summary: Get a user by ID
   *     tags: [User]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: User ID
   *     responses:
   *       200:
   *         description: User found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  private async getUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const user = await this.userService.getUserById(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  }

  /**
   * @swagger
   * /v1/user/email/{email}:
   *   get:
   *     summary: Get user by email
   *     tags: [User]
   *     parameters:
   *       - in: path
   *         name: email
   *         schema:
   *           type: string
   *         required: true
   *         description: User email
   *     responses:
   *       200:
   *         description: User found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  private async getUserByEmail(req: Request, res: Response): Promise<void> {
    const { email } = req.params;
    const user = await this.userService.getUserByEmail(email);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  }

  /**
   * @swagger
   * /v1/user/{id}:
   *   put:
   *     summary: Update a user
   *     tags: [User]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: User ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/User'
   *     responses:
   *       200:
   *         description: User updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  private async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const updated = await this.userService.updateUser({ ...req.body, id: req.params.id });
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @swagger
   * /v1/user/{id}:
   *   delete:
   *     summary: Delete a user
   *     tags: [User]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: User ID
   *     responses:
   *       204:
   *         description: User deleted
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  private async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      await this.userService.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @swagger
   * components:
   *   schemas:
   *     User:
   *       type: object
   *       properties:
   *         id:
   *           type: string
   *         email:
   *           type: string
   *         name:
   *           type: string
   *         preferences:
   *           type: object
   *           nullable: true
   *         createdAt:
   *           type: string
   *           format: date-time
   *         updatedAt:
   *           type: string
   *           format: date-time
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
