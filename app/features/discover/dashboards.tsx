import LoadMore from "./components/load-more";
import SortBy from "./components/dashboards-sort-by";
import SearchTerm from "./components/search-term";
import SortsFilters from "./components/sorts-filters";
import GridContainer from "./components/grid-container";
import DashboardCard from "./components/dashboard-card";
import ProjectFilter from "./components/project-filter";
import { NoResults } from "./components/no-results";
import { motion } from "framer-motion";
import LoadingSkeleton from "./components/loading-skeleton";
import { useDiscoverDashboards } from "~/state/machines/discover/discover-dashboards";
import LikeFilter from "./components/like-filter";
import { useCurrentUser } from "../current-user/current-user.machine";

const Dashboards = () => {
  const {
    dashboards,
    projects,
    isLoading,
    setSort,
    sortBy,
    isFinished,
    setProject,
    setLikedByMe,
    activeProject,
    isEmpty,
    loadMore,
    lazyLoadMore,
    hasMoreData,
    setSearchTerm,
    searchTerm,
    likedByMe,
  } = useDiscoverDashboards();
  const { currentUser } = useCurrentUser();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <main className="dark:bg-gray-100">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
        <SortsFilters
          leftSlot={<SearchTerm onChange={setSearchTerm} value={searchTerm} />}
          rightSlot={
            <>
              {currentUser && <LikeFilter onSetLikedByMe={setLikedByMe} likedByMe={likedByMe} />}
              <ProjectFilter projects={projects} onChange={setProject} projectName={activeProject} />
              <SortBy sortBy={sortBy} onChange={setSort} />
            </>
          }
        />
        {isEmpty ? (
          <NoResults />
        ) : (
          <GridContainer onReachThreshold={lazyLoadMore}>
            {dashboards.map((dashboard, i) => (
              <DashboardCard key={i} dashboardRef={dashboard.ref} onSelectProject={setProject} showUser />
            ))}
          </GridContainer>
        )}

        {isFinished ? (
          <div className="flex w-full justify-center p-20">
            <p className="p-1 text-sm text-gray-50">No More Results</p>
          </div>
        ) : (
          !isEmpty && <LoadMore isLoading={hasMoreData} onClick={loadMore} />
        )}
      </motion.div>
    </main>
  );
};

export default Dashboards;
