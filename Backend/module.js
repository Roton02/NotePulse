const fs = require("fs");
const path = require("path");

const rawName = process.argv[2];

if (!rawName) {
  console.error("❌ Please provide a module name.\nUsage: node module.js moduleName");
  process.exit(1);
}

// The name is used as a folder and as TypeScript identifiers, so keep it to letters and digits.
if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(rawName)) {
  console.error("❌ Module name must start with a letter and contain only letters and numbers.");
  process.exit(1);
}

const moduleName = rawName.toLowerCase();
const capModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
const baseDir = path.join(__dirname, "src", "app", "modules", moduleName);

if (fs.existsSync(baseDir)) {
  console.error(`❌ Module "${moduleName}" already exists.`);
  process.exit(1);
}

fs.mkdirSync(baseDir, { recursive: true });

const files = {
  [`${moduleName}.interface.ts`]: `
export interface I${capModule} {
  // Define fields
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}
  `,

  [`${moduleName}.model.ts`]: `
import { model, Schema } from 'mongoose';
import { I${capModule} } from './${moduleName}.interface';

const ${moduleName}Schema = new Schema<I${capModule}>(
  {
    // Define fields
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
  },
  { timestamps: true }
);

export const ${capModule} = model<I${capModule}>('${capModule}', ${moduleName}Schema);
  `,

  [`${moduleName}.service.ts`]: `
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiErrors';
import { I${capModule} } from './${moduleName}.interface';
import { ${capModule} } from './${moduleName}.model';

const create${capModule} = async (payload: Partial<I${capModule}>) => {
  return await ${capModule}.create(payload);
};

const getAll${capModule}s = async () => {
  return await ${capModule}.find().sort({ createdAt: -1 });
};

const get${capModule}ById = async (id: string) => {
  const result = await ${capModule}.findById(id);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, '${capModule} not found');
  }
  return result;
};

const update${capModule} = async (id: string, payload: Partial<I${capModule}>) => {
  const result = await ${capModule}.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, '${capModule} not found');
  }
  return result;
};

const delete${capModule} = async (id: string) => {
  const result = await ${capModule}.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, '${capModule} not found');
  }
  return result;
};

export const ${moduleName}Services = {
  create${capModule},
  getAll${capModule}s,
  get${capModule}ById,
  update${capModule},
  delete${capModule},
};
  `,

  [`${moduleName}.controller.ts`]: `
import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { ${moduleName}Services } from './${moduleName}.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';

const create${capModule} = catchAsync(async (req: Request, res: Response) => {
  const result = await ${moduleName}Services.create${capModule}(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: '${capModule} created successfully',
    data: result,
  });
});

const getAll${capModule}s = catchAsync(async (_req: Request, res: Response) => {
  const result = await ${moduleName}Services.getAll${capModule}s();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: '${capModule}s retrieved successfully',
    data: result,
  });
});

const get${capModule}ById = catchAsync(async (req: Request, res: Response) => {
  const result = await ${moduleName}Services.get${capModule}ById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: '${capModule} retrieved successfully',
    data: result,
  });
});

const update${capModule} = catchAsync(async (req: Request, res: Response) => {
  const result = await ${moduleName}Services.update${capModule}(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: '${capModule} updated successfully',
    data: result,
  });
});

const delete${capModule} = catchAsync(async (req: Request, res: Response) => {
  await ${moduleName}Services.delete${capModule}(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: '${capModule} deleted successfully',
  });
});

export const ${moduleName}Controllers = {
  create${capModule},
  getAll${capModule}s,
  get${capModule}ById,
  update${capModule},
  delete${capModule},
};
  `,

  [`${moduleName}.validation.ts`]: `
import { z } from 'zod';

const create${capModule}Schema = z.object({
  // Define fields
  name: z.string({ required_error: 'Name is required' }).trim().min(1, 'Name is required'),
});

const update${capModule}Schema = create${capModule}Schema.partial();

export const ${capModule}Validation = {
  create${capModule}Schema,
  update${capModule}Schema,
};
  `,

  [`${moduleName}.routes.ts`]: `
import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { ${moduleName}Controllers } from './${moduleName}.controller';
import { ${capModule}Validation } from './${moduleName}.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(${capModule}Validation.create${capModule}Schema),
  ${moduleName}Controllers.create${capModule}
);
router.get('/', ${moduleName}Controllers.getAll${capModule}s);
router.get('/:id', ${moduleName}Controllers.get${capModule}ById);
router.patch(
  '/:id',
  validateRequest(${capModule}Validation.update${capModule}Schema),
  ${moduleName}Controllers.update${capModule}
);
router.delete('/:id', ${moduleName}Controllers.delete${capModule});

export const ${moduleName}Routes = router;
  `,
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(baseDir, filename), content.trimStart());
}

console.log(`✅ ${capModule} module created at src/app/modules/${moduleName}`);
console.log(`👉 Register it in src/app/routes/index.ts:`);
console.log(`   import { ${moduleName}Routes } from '../modules/${moduleName}/${moduleName}.routes';`);
console.log(`   // add to moduleRoutes: { path: '/${moduleName}s', route: ${moduleName}Routes }`);
