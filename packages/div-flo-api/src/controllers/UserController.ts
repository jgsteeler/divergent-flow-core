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
    this.router.get('/', this.listUsers.bind(this));
    this.router.post('/', this.createUser.bind(this));
    this.router.post('/provision-oidc', this.provisionFromOIDC.bind(this));
    this.router.get('/email/:email', this.getUserByEmail.bind(this));
    this.router.get('/username/:username', this.getUserByUsername.bind(this));
    this.router.get('/email/:email', this.getUserByEmail.bind(this));
    this.router.get('/username/:username', this.getUserByUsername.bind(this));
    this.router.get('/:id', this.getUser.bind(this));
    this.router.put('/:id', this.updateUser.bind(this));
    this.router.delete('/:id', this.deleteUser.bind(this));
  }

  /**
   * @swagger
   * /v1/user:
   *   get:
   *     summary: List all users
   *     tags: [User]
   *     responses:
   *       200:
   *         description: List of users
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/User'
   *       400:
   *         description: Error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  private async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.listUsers();
      res.json(users);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
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
   * /v1/user/provision-oidc:
   *   post:
   *     summary: Provision user from OIDC claims (create or update)
   *     tags: [User]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - sub
   *               - email
   *             properties:
   *               sub:
   *                 type: string
   *                 description: OIDC subject identifier (user ID from identity provider)
   *               email:
   *                 type: string
   *               email_verified:
   *                 type: boolean
   *               preferred_username:
   *                 type: string
   *               name:
   *                 type: string
   *               given_name:
   *                 type: string
   *               family_name:
   *                 type: string
   *     responses:
   *       200:
   *         description: User provisioned (created or updated)
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
  private async provisionFromOIDC(req: Request, res: Response): Promise<void> {
    try {
      const { sub, email, email_verified, preferred_username, name, given_name, family_name } = req.body;

      if (!sub || !email) {
        res.status(400).json({ error: 'sub and email are required' });
        return;
      }

      // Check if user already exists with this OIDC provider account
      const existingUser = await this.userService.getUserByOAuthAccount('keycloak', sub);
      
      if (existingUser) {
        // Update last login time
        const updated = await this.userService.updateUser({ 
          id: existingUser.id, 
          lastLoginAt: new Date() 
        });
        res.json(updated);
        return;
      }

      // Check if user exists by email (might have been created via different method)
      let user = await this.userService.getUserByEmail(email);

      if (user) {
        // Link OIDC account to existing user
        await this.userService.createOAuthAccount({
          userId: user.id,
          provider: 'keycloak',
          providerAccountId: sub,
        });
        // Update last login
        user = await this.userService.updateUser({ 
          id: user.id, 
          lastLoginAt: new Date() 
        });
      } else {
        // Create new user with OIDC account
        const username = preferred_username || email.split('@')[0];
        user = await this.userService.createUser({
          email,
          username,
          emailVerified: email_verified || false,
          password: null, // OAuth users don't have passwords
          lastLoginAt: new Date(),
        });

        // Create OAuth account link
        await this.userService.createOAuthAccount({
          userId: user.id,
          provider: 'keycloak',
          providerAccountId: sub,
        });

        // Create user profile with name info
        if (name || given_name || family_name) {
          await this.userService.createUserProfile({
            userId: user.id,
            displayName: name,
            firstName: given_name,
            lastName: family_name,
          });
        }
      }

      res.json(user);
    } catch (error: any) {
      console.error('Error provisioning user from OIDC:', error);
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
   * /v1/user/username/{username}:
   *   get:
   *     summary: Get user by username
   *     tags: [User]
   *     parameters:
   *       - in: path
   *         name: username
   *         schema:
   *           type: string
   *         required: true
   *         description: Username
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
  private async getUserByUsername(req: Request, res: Response): Promise<void> {
    const { username } = req.params;
    const user = await this.userService.getUserByUsername(username);
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
   *         username:
   *           type: string
   *         emailVerified:
   *           type: boolean
   *         password:
   *           type: string
   *           nullable: true
   *         lastLoginAt:
   *           type: string
   *           format: date-time
   *           nullable: true
   *         createdAt:
   *           type: string
   *           format: date-time
   *         updatedAt:
   *           type: string
   *           format: date-time
   *         profile:
   *           $ref: '#/components/schemas/UserProfile'
   *           nullable: true
   *         oauthAccounts:
   *           type: array
   *           items:
   *             $ref: '#/components/schemas/OAuthAccount'
   *     UserProfile:
   *       type: object
   *       properties:
   *         id:
   *           type: string
   *         userId:
   *           type: string
   *         displayName:
   *           type: string
   *           nullable: true
   *         firstName:
   *           type: string
   *           nullable: true
   *         lastName:
   *           type: string
   *           nullable: true
   *         avatarUrl:
   *           type: string
   *           nullable: true
   *         bio:
   *           type: string
   *           nullable: true
   *         timezone:
   *           type: string
   *           nullable: true
   *         preferences:
   *           type: object
   *           nullable: true
   *         createdAt:
   *           type: string
   *           format: date-time
   *         updatedAt:
   *           type: string
   *           format: date-time
   *     OAuthAccount:
   *       type: object
   *       properties:
   *         id:
   *           type: string
   *         userId:
   *           type: string
   *         provider:
   *           type: string
   *         providerAccountId:
   *           type: string
   *         tokenType:
   *           type: string
   *           nullable: true
   *         scope:
   *           type: string
   *           nullable: true
   *         expiresAt:
   *           type: string
   *           format: date-time
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
