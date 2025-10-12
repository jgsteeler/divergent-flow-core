import { Router, Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IVersionService } from '@div-flo/models';

/**
 * @swagger
 * components:
 *   schemas:
 *     VersionInfo:
 *       type: object
 *       properties:
 *         version:
 *           type: string
 *           description: The version of the service
 *           example: "0.1.0"
 *         service:
 *           type: string
 *           description: The name of the service
 *           example: "divergent-flow-core"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the version info was generated UTC
 *           example: "2025-10-06T20:30:00.000Z"
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 */

@injectable()
export class VersionController {
  private router: Router;

  constructor(
    @inject('IVersionService') private versionService: IVersionService
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get('/', this.getVersion.bind(this));
  }

  /**
   * @swagger
   * /version:
   *   get:
   *     summary: Get version information
   *     description: Returns the current version, service name, and timestamp
   *     tags:
   *       - Version
   *     responses:
   *       200:
   *         description: Version information retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/VersionInfo'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  private async getVersion(req: Request, res: Response): Promise<void> {
    try {
      const versionInfo = await this.versionService.getVersion();
      res.json(versionInfo);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get version information' });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}