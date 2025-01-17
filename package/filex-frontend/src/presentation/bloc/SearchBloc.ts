import { useFolderStore } from '../../stores/folderStore';
import { useSearchStore } from '../../stores/searchStore';

export class SearchBloc {
    private folderStore = useFolderStore();
    private searchStore = useSearchStore();
    
    get folderName() {
        const selectedFolder = this.folderStore.selectedFolderContents;
        return selectedFolder?.name || 'Root Folder';
    }

    get currentFolderId() {
        return this.folderStore.selectedFolderId;
    }

    async search(query: string) {
        if (!query.trim()) {
            this.searchStore.resetSearch();
            return;
        }

        this.searchStore.setSearching(true);
        this.searchStore.setSearchQuery(query);
        await this.searchFolders(query);
    }

    private async searchFolders(query: string) {
        try {
            const response = await fetch(
                `http://localhost:3000/api/v1/folders?` + 
                new URLSearchParams({
                    search: query,
                    parent_id: this.currentFolderId?.toString() || '',
                    page: this.searchStore.getCurrentPage.toString(),
                    limit: '10'
                })
            );

            const responseData = await response.json();
            this.searchStore.setSearchResults(responseData.data.data, responseData.data.hasMore);
            this.searchStore.setSearching(false);
            
        } catch (error) {
            console.error('Search error:', error);
            this.searchStore.setSearching(false);
        }
    }

    get isLoading() {
        return this.searchStore.getIsSearching;
    }

    get searchResults() {
        return this.searchStore.getSearchResults;
    }

    get hasMoreResults() {
        return this.searchStore.getHasMore;
    }

    resetSearch() {
        this.searchStore.resetSearch();
    }
}