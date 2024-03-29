import FacebookIcon from "@mui/icons-material/Facebook";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import YouTubeIcon from "@mui/icons-material/YouTube";
import {
  Box,
  Button,
  IconButton,
  Sheet,
  Table,
  Tooltip,
  Typography,
  iconButtonClasses,
} from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { columnsTableCompany } from "../../data/columns.ts";
import Company, { CheckedStatus } from "../../data/company.ts";
import { Page } from "../../data/companyDetails.tsx";
import { ErrorJwtAuth } from "../../data/errorAuthJwt.ts";
import useAuthStore from "../../store/authStore.tsx";
import { useCompanyStore } from "../../store/companyStore.tsx";
import { useCompanyFilterStore } from "../../store/filtersStore.tsx";
import { companyJsonToCompany } from "../../utils/companyJsonToCompany.tsx";
import { TableSkeleton } from "../Skeleton/index.tsx";
import { StatutIcon, manageIsChecked } from "../StatutIcon/index.tsx";
import "./style.css";

// https://www.material-react-table.com/
// Using this ?

// TODO: Replace this with the data from the API
/*
const leader1 = new Leader(1, "JEAN", "Dupont", new Date("1990-01-01"), "06 00 00 00 00", "email", [{ id: 1, denomination: "Entreprise 1" }])
const leader2 = new Leader(2, "JOSEPHE", "Dupont", new Date("1990-01-01"), "06 00 00 00 00", "email", [{ id: 2, denomination: "Entreprise 1" }])
const leader3 = new Leader(3, "HENRI", "Dupont", new Date("1990-01-01"), "06 00 00 00 00", "email", [{ id: 4, denomination: "Entreprise 4" }])
const leader4 = new Leader(4, "EUDES", "Dupont", new Date("1990-01-01"), "06 00 00 00 00", "email", [{ id: 5, denomination: "Entreprise 5" }])
const leader5 = new Leader(5, "HERCUL", "Dupont", new Date("1990-01-01"), "06 00 00 00 00", "email", [{ id: 6, denomination: "Entreprise 6" }])
*/
async function fetchCompanies(url: string, page: number) {
  const response = await fetch(
    `${import.meta.env.VITE_SERVER_URL}/${url}page=${page}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (response.ok && response.status === 200) {
    const data: Page<Company> = await response.json();

    const companies: Company[] = data.content
      .map((companyObj) => companyJsonToCompany(companyObj))
      .filter(Boolean) as Company[];

    const checkedDone = JSON.parse(localStorage.getItem("checkedDone") || "[]");
    const checkedToDo = JSON.parse(localStorage.getItem("checkedToDo") || "[]");

    const updatedCompanyData = companies.map((company) => {
      if (checkedDone.includes(company.getId())) {
        company.setChecked(CheckedStatus.Done);
      } else if (checkedToDo.includes(company.getId())) {
        company.setChecked(CheckedStatus.ToDo);
      } else {
        company.setChecked(CheckedStatus.NotDone);
      }
      return company;
    });

    data.content = updatedCompanyData;

    return data;
  } else {
    const errorData: ErrorJwtAuth = await response.json();
    if (response.status == 401) {
      toast.error(errorData.message);
      throw new Error(errorData.message);
    } else {
      throw new Error(errorData.message);
    }
  }
}

type Props = {
  url: string;
};

/**
 *
 * @param param0 Takes a callback function as a parameter and displays a table of companies
 * @returns A table of companies with their details
 */
export default function TableCompany({ url }: Props) {
  const [dataPagniation, setDataPagination] = React.useState({
    page: 0,
    rowsPerPage: 10,
    totalPages: 0,
  });
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const { selectedCompany, setSelectedCompany } = useCompanyStore();
  const { setAuthUser, setRequestLoading } = useAuthStore();

  const { searchParams } = useCompanyFilterStore();

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["companies", url, dataPagniation.page, searchParams],
    queryFn: () => fetchCompanies(url, dataPagniation.page),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data != null) {
      setDataPagination((prevDataPagination) => ({
        ...prevDataPagination,
        totalPages: data.totalPages,
      }));
      setCompanies(data.content);
    }
  }, [data]);

  const handleChangePage = (newPage: number) => {
    setDataPagination((prevDataPagination) => ({
      ...prevDataPagination,
      page: newPage,
    }));
  };

  // const handleChangeRowsPerPage = (
  //   event: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   setDataPagination((prevDataPagination) => ({
  //     ...prevDataPagination,
  //     rowsPerPage: +event.target.value,
  //     page: 0,
  //   }));
  // };

  const handleDetailsClick = (company: Company) => {
    // If the company is the same as the selected one, do nothing to avoid re-rendering
    if (company !== selectedCompany) {
      setSelectedCompany(company);
      console.log("Company selected: ", selectedCompany);
    }
  };

  // TODO : Another function is in the file src/pages/Company/index.tsx
  const handleChangeStatut = (company: Company) => {
    let newStatus: CheckedStatus;

    if (company.getChecked() === CheckedStatus.NotDone) {
      newStatus = CheckedStatus.ToDo;
    } else if (company.getChecked() === CheckedStatus.ToDo) {
      newStatus = CheckedStatus.Done;
    } else {
      newStatus = CheckedStatus.NotDone;
    }

    company.setChecked(newStatus);
    manageIsChecked(company.getId(), newStatus);

    // Change the status of the company in data
    setCompanies((prevCompanies) =>
      prevCompanies.map((item) =>
        item.getId() === company.getId() ? company : item
      )
    );
    return newStatus;
  };

  if (error != null && isError) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          overflow: "visible",
        }}
      >
        <h1>{error.message}</h1>
        <Button
          variant="soft"
          color="primary"
          onClick={() => {
            setRequestLoading(true);
            setAuthUser(null);
            setRequestLoading(false);
          }}
        >
          Se reconnecter
        </Button>
      </div>
    );
  }
  if (isPending) {
    return <TableSkeleton columns={columnsTableCompany} />;
  } else if (data.empty) {
    return (
      <a
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "19px",
          color: "#666",
          height: "100%",
        }}
      >
        Aucune entreprise trouvée
      </a>
    );
  } else if (
    !data.empty &&
    Array.isArray(data.content) &&
    typeof data.content[0].getAdresse === "function"
  ) {
    return (
      <React.Fragment>
        <Sheet
          className="OrderTableContainer"
          variant="outlined"
          sx={{
            display: { xs: "none", sm: "initial" },
            width: "100%",
            borderRadius: "sm",
            flexShrink: 1,
            overflow: "auto",
            minHeight: 0,
            fontFamily: "Poppins",
          }}
        >
          <Table
            aria-labelledby="tableTitle"
            stickyHeader
            hoverRow
            sx={{
              "--TableCell-headBackground":
                "var(--joy-palette-background-level1)",
              "--Table-headerUnderlineThickness": "1px",
              "--TableRow-hoverBackground":
                "var(--joy-palette-background-level1)",
              "--TableCell-paddingY": "4px",
              "--TableCell-paddingX": "8px",
            }}
          >
            <thead>
              <tr>
                {columnsTableCompany.map((column) => (
                  <th
                    key={column.id}
                    align={column.align}
                    style={{
                      minWidth: column.minWidth,
                      fontSize: 16,
                    }}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody
              style={{
                wordBreak: "break-word",
              }}
            >
              {companies.map((row, number) => {
                return (
                  //Afficher les details de l'entreprise en cliquant dessus
                  <tr
                    role="checkbox"
                    tabIndex={-1}
                    key={row.getId() + "rowdetails"}
                    onClick={() => handleDetailsClick(row)}
                    style={{ cursor: "pointer" }}
                  >
                    <td key={row.getId() + "checbox"} align="center">
                      <IconButton
                        id={`checkbox-${number}`}
                        style={{
                          border: "none",
                          backgroundColor: "transparent",
                          cursor: "pointer",
                        }}
                        onClick={(e) => {
                          e.stopPropagation(); // Pour éviter de déclencher handleDetailsClick
                          row.setChecked(handleChangeStatut(row));
                        }}
                      >
                        <StatutIcon statut={row.getChecked()} />
                      </IconButton>
                    </td>
                    {/* Slice to exclude the id */}
                    {columnsTableCompany.slice(1).map((column) => {
                      if (column.id === "social") {
                        return (
                          <td key={column.id} align={column.align}>
                            {row.getFacebook() && (
                              <FacebookIcon style={{ color: "#3b5998" }} />
                            )}
                            {row.getTwitter() && (
                              <TwitterIcon style={{ color: "#1DA1F2" }} />
                            )}
                            {row.getLinkedin() && (
                              <LinkedInIcon style={{ color: "#0e76a8" }} />
                            )}
                            {row.getYoutube() && (
                              <YouTubeIcon style={{ color: "red" }} />
                            )}
                          </td>
                        );
                      } else if (column.id === "checked") {
                        return (
                          <td key={column.id} align={column.align}>
                            <StatutIcon statut={row.getChecked()} />
                          </td>
                        );
                      } else if (column.id === "dateImmatriculation") {
                        return (
                          <td key={column.id} align={column.align}>
                            {row.getDateImmatriculation() ?? "N/A"}
                          </td>
                        );
                      } else if (column.id === "secteurActivite") {
                        return (
                          <td key={column.id} align={column.align}>
                            {row.getSecteurActivite() ?? "N/A"}
                          </td>
                        );
                      } else if (column.id === "formeJuridique") {
                        return (
                          <td key={column.id} align={column.align}>
                            {row.getFormeJuridique() ?? "N/A"}
                          </td>
                        );
                      } else if (column.id === "adresse") {
                        return (
                          <td key={column.id} align={column.align}>
                            {row.getAdresse() ?? "N/A"}
                          </td>
                        );
                      } else if (column.id === "codePostal") {
                        return (
                          <td key={column.id} align={column.align}>
                            {row.getCodePostal() ?? "N/A"}
                          </td>
                        );
                      } else if (column.id === "ville") {
                        return (
                          <td key={column.id} align={column.align}>
                            {row.getVille() ?? "N/A"}
                          </td>
                        );
                      } else if (column.id === "region") {
                        return (
                          <td key={column.id} align={column.align}>
                            {row.getRegion()}
                          </td>
                        );
                      } else if (column.id === "denomination") {
                        return (
                          <td key={column.id} align={column.align}>
                            {row.getDenomination() ?? "N/A"}
                          </td>
                        );
                      } else if (column.id === "phone") {
                        return (
                          <td key={column.id} align={column.align}>
                            {row.getPhone() ?? "N/A"}
                          </td>
                        );
                      } else if (column.id === "email") {
                        return (
                          <td key={column.id} align={column.align}>
                            {row.getEmail() ?? "N/A"}
                          </td>
                        );
                      } else if (column.id === "website") {
                        return (
                          <td
                            key={column.id}
                            align={column.align}
                            style={{
                              maxWidth: "10px",
                              maxHeight: "10px",
                              overflow: "hidden",
                              wordBreak: "normal",
                            }}
                            onClick={(e) => {
                              if (
                                e.target === e.currentTarget &&
                                row.getWebsite() != null &&
                                row.getWebsite() != ""
                              ) {
                                e.stopPropagation(); // To avoid triggering handleDetailsClick
                                window.open(row.getWebsite(), "_blank");
                              }
                            }}
                          >
                            {row.getWebsite() ?? "N/A"}
                          </td>
                        );
                      }
                    })}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Sheet>
        <Box>
          <Box
            sx={{
              pt: 2,
              gap: 1,
              [`& .${iconButtonClasses.root}`]: { borderRadius: "50%" },
              display: {
                xs: "none",
                md: "flex",
              },
            }}
          >
            <Box
              sx={{
                flexDirection: "row",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Tooltip title="Page précédente">
                <IconButton
                  size="sm"
                  color="neutral"
                  variant="outlined"
                  disabled={dataPagniation.page === 0}
                  onClick={() => handleChangePage(dataPagniation.page - 1)}
                  sx={{ bgcolor: "background.surface" }}
                >
                  <KeyboardArrowLeftIcon />
                </IconButton>
              </Tooltip>
              <Typography level="body-md">
                {dataPagniation.page + 1} / {dataPagniation.totalPages}
              </Typography>
              <Tooltip title="Page suivante">
                <IconButton
                  size="sm"
                  color="neutral"
                  variant="outlined"
                  disabled={
                    dataPagniation.page === dataPagniation.totalPages - 1
                  }
                  onClick={() => handleChangePage(dataPagniation.page + 1)}
                  sx={{ bgcolor: "background.surface" }}
                >
                  <KeyboardArrowRightIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </React.Fragment>
    );
  }
}
