import { bidHistoryKey, itemKey } from '$services/keys';
import { client } from '$services/redis';
import type { CreateBidAttrs, Bid } from '$services/types';
import { DateTime } from 'luxon';
import { getItem } from './items';

export const createBid = async (attrs: CreateBidAttrs) => {

	return client.executeIsolated(async (isolatedClient) => {

		await isolatedClient.watch(itemKey(attrs.itemId));

		const item = await getItem(attrs.itemId);

		if (!item) {
			throw new Error('Item does not exist');
		}

		if (item.price >= attrs.amount) {
			throw new Error('Bid too low');
		}

		if (item.endingAt.diff(DateTime.now()).toMillis() < 0) {
			throw new Error('Item closed to bindding');
		}

		const serealized = serelize(
			attrs.amount,
			attrs.createdAt.toMillis()
		);

		return isolatedClient.multi()
			.rPush(bidHistoryKey(attrs.itemId), serealized)
			.hSet(itemKey(item.id), {
				bids: item.bids + 1,
				price: attrs.amount,
				highestBidUserId: attrs.userId
			})
			.exec();
	});



};

export const getBidHistory = async (itemId: string, offset = 0, count = 10): Promise<Bid[]> => {
	const startIndex = -1 * offset - count;
	const endIndex = -1 - offset;

	const range = await client.lRange(bidHistoryKey(itemId), startIndex, endIndex);

	return range.map(bid => deserealize(bid));
};

const serelize = (amount: number, createdAt: number) => {
	return `${amount}:${createdAt}`;
}

const deserealize = (stored: string) => {
	const [amount, createdAt] = stored.split(':');

	return {
		amount: parseFloat(amount),
		createdAt: DateTime.fromMillis(parseInt(createdAt))
	}
}