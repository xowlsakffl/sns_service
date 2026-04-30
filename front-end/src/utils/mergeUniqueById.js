function mergeUniqueById(previousItems = [], nextItems = []) {
  const seenIds = new Set(previousItems.map((item) => item?.id));
  const mergedItems = [...previousItems];

  nextItems.forEach((item) => {
    const itemId = item?.id;

    if (seenIds.has(itemId)) {
      return;
    }

    seenIds.add(itemId);
    mergedItems.push(item);
  });

  return mergedItems;
}

export default mergeUniqueById;
