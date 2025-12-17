import { HomElement } from '@ar-project/host-object-model';

export const getFileName = (
  breadCrumbs: HomElement[],
): { fileName: string | null; } => {
  if (!breadCrumbs || breadCrumbs.length === 0) {
    return { fileName: null };
  }

  let fileName: string | null = null;

  console.log('outer:', breadCrumbs);
  // 處理所有麵包屑元素
  for (let i = 0; i < breadCrumbs.length; i += 1) {
    const breadCrumb = breadCrumbs[i];
    const isLast = i === breadCrumbs.length - 1;
    const childrenLength = breadCrumb.children.length;

    let segment: string | null = null;
    if (!isLast) {
      // 不是最後一項
      if (childrenLength === 2) {
        segment = breadCrumb.children[0].name;
      } else if (childrenLength === 3) {
        segment = breadCrumb.children[1].name;
      }
    } else if (childrenLength === 2) {
      // 是最後一項
      segment = breadCrumb.children[1].name;
    }
    
    // 如果segment有效且不為空
    if (segment && segment !== '') {
      // 檢查是否為檔案名稱 (包含 '.')
      if (!fileName && segment.includes('.')) {
        let cleanName = segment.replace(/\\/g, '/').split('/').pop() || '';
        if (cleanName.includes(' • ')) {
          cleanName = cleanName.split(' • ')[0];
        }
        if (cleanName.includes(' - ')) {
          cleanName = cleanName.split(' - ')[0];
        }

        fileName = cleanName.trim(); // 去除前後空白
        break; // 找到檔案名稱後停止處理
      }
    }
  }
  console.log('after:', fileName);
  return { fileName };
};

export default getFileName;
