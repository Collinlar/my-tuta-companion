import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Register for every test file, including runs that reuse one worker/module
// cache. Automatic registration only runs on the library's first import.
afterEach(cleanup);
