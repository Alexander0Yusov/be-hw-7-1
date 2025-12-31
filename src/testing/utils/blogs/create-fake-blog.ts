import { BlogInputDto } from 'src/modules/bloggers-platform/dto/blog/blog-input.dto';

const testBlogData: BlogInputDto = {
  name: 'blog 1',
  description: 'desc blog 1',
  websiteUrl: 'https://www.youtube.com',
};

export const createFakeBlog = (blog?: BlogInputDto) => {
  let newBlog = testBlogData;

  if (blog) {
    newBlog = {
      ...blog,
    };
  }

  return newBlog;
};
