import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {} // Inject the ConfigService

  use(req: Request, res: Response, next: NextFunction) {
    const secretKey = this.configService.get('jwt_secret'); // Access the jwt_secret configuration value
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      try {
        const decoded = jwt.verify(token, secretKey) as { userId: number };

        req['user'] = { id: decoded.userId };
      } catch (error) {
        return res.status(401).json({ message: 'Access denied' });
      }
    } else {
      return res.status(401).json({ message: 'Access denied' });
    }
    next();
  }
}
